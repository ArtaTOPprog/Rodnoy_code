import json
import logging
import math
import re

from celery import shared_task
from django.db import transaction
from django.db.models import Q

from . import openai_client
from .models import Generated_Route, Generated_Route_Place, Place

logger = logging.getLogger(__name__)

MAX_PLACES = 15
MAX_DAYS = 7
DEFAULT_DAYS = 3

SYSTEM_PROMPT = (
    "Ты — гид сервиса «Родной Код», который составляет персональные культурные маршруты по России. "
    "Тебе дают анкету путешественника и список мест из каталога, уже разложенных по дням. "
    "Верни только JSON-объект вида "
    '{"title": "короткое название маршрута", "summary": "план поездки", "notes": {"<id места>": "заметка"}}. '
    "summary — связный план поездки по дням на русском языке, 3–6 абзацев, с учётом интересов, "
    "компании и того, чего путешественник не хочет. notes — одна-две фразы к каждому месту: "
    "чем оно подходит этому путешественнику и на что обратить внимание. "
    "Используй только места из списка и не выдумывай адреса, цены, часы работы и события."
)


def parse_days(value):
    match = re.search(r"\d+", str(value or ""))
    days = int(match.group()) if match else DEFAULT_DAYS
    return max(1, min(MAX_DAYS, days))


def plural_days(days):
    if days % 10 == 1 and days % 100 != 11:
        return f"{days} день"
    if 2 <= days % 10 <= 4 and not 12 <= days % 100 <= 14:
        return f"{days} дня"
    return f"{days} дней"


def pick_places(questionnaire):
    region = (questionnaire.region or "").strip()
    places = Place.objects.all()
    if region:
        places = places.filter(Q(region__icontains=region) | Q(city__icontains=region))

    interests = [i.strip() for i in (questionnaire.interes or []) if isinstance(i, str) and i.strip()]
    selected = places
    if interests:
        by_interest = Q()
        for interest in interests:
            by_interest |= Q(tags__contains=[interest])
        selected = places.filter(by_interest)

    selected = list(selected.distinct()[:MAX_PLACES])
    if len(selected) < 3:
        extra = (
            places.exclude(id__in=[p.id for p in selected])
            .order_by("-is_popular", "-rating", "name")[: MAX_PLACES - len(selected)]
        )
        selected += list(extra)
    return selected


def split_by_days(places, days):
    if not places:
        return []
    per_day = max(1, math.ceil(len(places) / days))
    return [(idx // per_day + 1, idx % per_day, place) for idx, place in enumerate(places)]


def catalog_text(questionnaire, schedule, days):
    if not schedule:
        return "Не удалось подобрать места. Попробуйте изменить регион или интересы."
    region = (questionnaire.region or "").strip()
    lines = [f"Маршрут{': ' + region if region else ''} на {plural_days(days)}."]
    by_day = {}
    for day, _, place in schedule:
        by_day.setdefault(day, []).append(place.name or "Место без названия")
    for day in sorted(by_day):
        lines.append(f"День {day}: {', '.join(by_day[day])}.")
    return "\n".join(lines)


def ai_plan(questionnaire, schedule, days):
    payload = {
        "anketa": {
            "region": questionnaire.region,
            "travel_date": questionnaire.travel_date,
            "duration_days": days,
            "companions": questionnaire.companions,
            "interests": questionnaire.interes,
            "format": questionnaire.format_travel,
            "unwanted": questionnaire.unwanted,
            "ideal_route": questionnaire.ideal_route,
        },
        "places": [
            {
                "id": place.id,
                "day": day,
                "name": place.name,
                "category": place.category,
                "city": place.city,
                "description": (place.description or "")[:400],
            }
            for day, _, place in schedule
        ],
    }
    result = openai_client.chat_json(SYSTEM_PROMPT, json.dumps(payload, ensure_ascii=False))

    summary = result.get("summary")
    if not isinstance(summary, str) or not summary.strip():
        raise openai_client.OpenAIUnavailable("В ответе OpenAI нет описания маршрута")

    known_ids = {place.id for _, _, place in schedule}
    notes = {}
    raw_notes = result.get("notes")
    if isinstance(raw_notes, dict):
        for key, value in raw_notes.items():
            try:
                place_id = int(key)
            except (TypeError, ValueError):
                continue
            if place_id in known_ids and isinstance(value, str) and value.strip():
                notes[place_id] = value.strip()[:500]

    title = result.get("title")
    title = title.strip()[:200] if isinstance(title, str) else ""
    return title, summary.strip()[:8000], notes


def build_route(itinerary):
    questionnaire = itinerary.questionnaire
    if questionnaire is None:
        raise ValueError("Анкета не привязана к маршруту")

    days = parse_days(questionnaire.duration_days)
    schedule = split_by_days(pick_places(questionnaire), days)

    title, text, notes, generator = "", catalog_text(questionnaire, schedule, days), {}, "catalog"
    if schedule and openai_client.is_enabled():
        try:
            title, text, notes = ai_plan(questionnaire, schedule, days)
            generator = "openai"
        except openai_client.OpenAIUnavailable as exc:
            logger.warning("Маршрут %s собран по каталогу: %s", itinerary.id, exc)

    with transaction.atomic():
        itinerary.generated_route_place_set.all().delete()
        Generated_Route_Place.objects.bulk_create([
            Generated_Route_Place(
                generated_route=itinerary,
                place=place,
                day_number=day,
                order=order,
                notes=notes.get(place.id, ""),
            )
            for day, order, place in schedule
        ])
        if title and not itinerary.title:
            itinerary.title = title
        itinerary.full_text = text
        itinerary.generator = generator
        itinerary.duration_days = days
        itinerary.status = "ready"
        itinerary.save(update_fields=["title", "full_text", "generator", "duration_days", "status", "updated_at"])


@shared_task(bind=True, max_retries=3)
def generate_itinerary(self, itinerary_id):
    try:
        itinerary = Generated_Route.objects.select_related("questionnaire").get(id=itinerary_id)
    except Generated_Route.DoesNotExist:
        logger.error("Маршрут с id %s не найден", itinerary_id)
        return None

    try:
        build_route(itinerary)
    except ValueError as exc:
        logger.error("Маршрут %s не собран: %s", itinerary_id, exc)
        mark_failed(itinerary)
        return None
    except Exception as exc:
        logger.exception("Ошибка генерации маршрута %s", itinerary_id)
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=60)
        mark_failed(itinerary)
        return None

    logger.info("Маршрут %s готов (%s)", itinerary_id, itinerary.generator)
    return f"Itinerary {itinerary_id} generated"


def mark_failed(itinerary):
    itinerary.status = "failed"
    itinerary.save(update_fields=["status", "updated_at"])
