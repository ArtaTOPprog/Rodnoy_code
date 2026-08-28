from django.db.models import Q
import logging
from celery import shared_task
from .models import Generated_Route, Questionnaire, Place, Generated_Route_Place

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def generate_itinerary(self, itinerary_id):
    try:
        itinerary = Generated_Route.objects.select_related('questionnaire').get(id=itinerary_id)
    except Generated_Route.DoesNotExist:
        logger.error(f"Маршрут с id {itinerary_id} не найден!")
        return

    try:
        questionnaire = itinerary.questionnaire
        if not questionnaire:
            raise ValueError("Анкета не привязана к маршруту")
        region = questionnaire.region
        interests = questionnaire.interes
        places = Place.objects.filter(region__icontains=region)

        if interests:
            q_objects = Q()
            for i in interests:
                q_objects |= Q(tags__contains=[i])
            places = places.filter(q_objects)

        if places.count() < 3:
            popular = Place.objects.filter(region__icontains=region, is_popular=True)[:5]
            places = places | popular

        places = places.distinct()[:15]

        Generated_Route_Place.objects.bulk_create([
            Generated_Route_Place(
                generated_route = itinerary,
                place = place,
                day_number = idx // 5 + 1,
                order = idx % 5,
            )
            for idx, place in enumerate(places)
        ])
            

        full_text = generate_route_text(places, questionnaire.duration_days)
        itinerary.full_text = full_text
        itinerary.status = 'ready'
        itinerary.save(update_fields=['fuul_text', 'status', 'updated_at'])

        logger.info(f"Маршрут {itinerary_id} успешно сгенерирован")
        return f"Itinerary {itinerary_id} generated"
    
    except Exception as exc:
        logger.exception(f"Ошибка генерации маршрута {itinerary_id}")
        itinerary.status = 'failed'
        itinerary.save(update_fields=['status', 'update_at'])
        raise self.retry(exc=exc, countdown=60)

def generate_route_text(places, duration_day):
    if not places:
        return "Не удалось подобрать места. Попоробуйте изменить параметры"

    days = duration_day or "3"
    names = "".join([p.name for p in places])
    return f"""
    """