import io
import json
import urllib.error
from unittest import mock

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from . import openai_client
from .models import Generated_Route, Place, Questionnaire, User
from .tasks import build_route, generate_itinerary, parse_days, plural_days


def openai_response(content):
    body = {"choices": [{"message": {"content": json.dumps(content, ensure_ascii=False)}}]}
    response = mock.MagicMock()
    response.__enter__.return_value.read.return_value = json.dumps(body).encode("utf-8")
    return response


class RouteBuildingTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ivan", password="Str0ngPass!x")
        self.places = [
            Place.objects.create(name=name, description=f"Описание: {name}", region="Татарстан", city="Казань")
            for name in ("Кремль", "Улица Баумана", "Старо-Татарская слобода", "Озеро Кабан")
        ]
        Place.objects.create(name="Эрмитаж", description="Музей", region="Ленинградская область", city="Санкт-Петербург")
        self.questionnaire = Questionnaire.objects.create(user=self.user, region="Казань", duration_days="2 дня")
        self.route = Generated_Route.objects.create(user=self.user, questionnaire=self.questionnaire)

    def test_parse_days(self):
        self.assertEqual(parse_days("2 дня"), 2)
        self.assertEqual(parse_days(""), 3)
        self.assertEqual(parse_days("30"), 7)
        self.assertEqual(plural_days(1), "1 день")
        self.assertEqual(plural_days(3), "3 дня")
        self.assertEqual(plural_days(5), "5 дней")

    @override_settings(OPENAI_API_KEY="")
    def test_without_key_route_is_built_from_catalog(self):
        build_route(self.route)
        self.route.refresh_from_db()
        self.assertEqual(self.route.status, "ready")
        self.assertEqual(self.route.generator, "catalog")
        self.assertEqual(self.route.duration_days, 2)
        self.assertIn("День 1:", self.route.full_text)
        self.assertIn("День 2:", self.route.full_text)
        items = list(self.route.generated_route_place_set.all())
        self.assertEqual(len(items), 4)
        self.assertEqual({item.day_number for item in items}, {1, 2})
        self.assertNotIn("Эрмитаж", [item.place.name for item in items])

    @override_settings(OPENAI_API_KEY="sk-test", OPENAI_MODEL="gpt-4o-mini")
    def test_with_key_openai_writes_text_and_notes(self):
        kremlin = self.places[0]
        content = {
            "title": "Казань за два дня",
            "summary": "День 1 — Кремль и прогулка по Баумана.\n\nДень 2 — слобода и озеро.",
            "notes": {str(kremlin.id): "Начните с панорамы.", "999999": "Лишнее место"},
        }
        with mock.patch("app.openai_client.urllib.request.urlopen", return_value=openai_response(content)) as urlopen:
            build_route(self.route)

        request = urlopen.call_args.args[0]
        self.assertTrue(request.full_url.endswith("/chat/completions"))
        self.assertEqual(request.get_header("Authorization"), "Bearer sk-test")
        sent = json.loads(request.data)
        self.assertEqual(sent["model"], "gpt-4o-mini")
        self.assertIn("Кремль", sent["messages"][1]["content"])

        self.route.refresh_from_db()
        self.assertEqual(self.route.generator, "openai")
        self.assertEqual(self.route.title, "Казань за два дня")
        self.assertTrue(self.route.full_text.startswith("День 1"))
        notes = {item.place_id: item.notes for item in self.route.generated_route_place_set.all()}
        self.assertEqual(notes[kremlin.id], "Начните с панорамы.")
        self.assertNotIn(999999, notes)

    @override_settings(OPENAI_API_KEY="sk-test")
    def test_openai_error_falls_back_to_catalog(self):
        error = urllib.error.HTTPError("url", 401, "Unauthorized", {}, io.BytesIO(b"bad key"))
        with mock.patch("app.openai_client.urllib.request.urlopen", side_effect=error):
            build_route(self.route)
        self.route.refresh_from_db()
        self.assertEqual(self.route.status, "ready")
        self.assertEqual(self.route.generator, "catalog")
        self.assertIn("День 1:", self.route.full_text)

    @override_settings(OPENAI_API_KEY="sk-test")
    def test_openai_answer_without_summary_falls_back_to_catalog(self):
        with mock.patch("app.openai_client.urllib.request.urlopen", return_value=openai_response({"notes": {}})):
            build_route(self.route)
        self.route.refresh_from_db()
        self.assertEqual(self.route.generator, "catalog")

    def test_user_title_is_not_replaced(self):
        self.route.title = "Мой маршрут"
        self.route.save()
        content = {"title": "Другое", "summary": "План", "notes": {}}
        with override_settings(OPENAI_API_KEY="sk-test"), \
                mock.patch("app.openai_client.urllib.request.urlopen", return_value=openai_response(content)):
            build_route(self.route)
        self.route.refresh_from_db()
        self.assertEqual(self.route.title, "Мой маршрут")

    def test_route_without_questionnaire_fails(self):
        route = Generated_Route.objects.create(user=self.user)
        generate_itinerary(route.id)
        route.refresh_from_db()
        self.assertEqual(route.status, "failed")

    def test_empty_region_gives_helpful_text(self):
        self.questionnaire.region = "Атлантида"
        self.questionnaire.save()
        Place.objects.all().delete()
        build_route(self.route)
        self.route.refresh_from_db()
        self.assertEqual(self.route.status, "ready")
        self.assertIn("Не удалось подобрать места", self.route.full_text)

    def test_is_enabled_follows_settings(self):
        with override_settings(OPENAI_API_KEY=""):
            self.assertFalse(openai_client.is_enabled())
            with self.assertRaises(openai_client.OpenAIUnavailable):
                openai_client.chat_json("system", "user")
        with override_settings(OPENAI_API_KEY="sk-test"):
            self.assertTrue(openai_client.is_enabled())


@override_settings(OPENAI_API_KEY="")
class RouteApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        response = self.client.post(
            "/api/register/", {"username": "ivan", "password": "Str0ngPass!x"}, format="json"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.json()['access']}")
        self.user = User.objects.get(username="ivan")
        self.other = User.objects.create_user(username="petr", password="Str0ngPass!x")
        Place.objects.create(name="Кремль", description="Крепость", region="Татарстан", city="Казань")

    def create_questionnaire(self):
        response = self.client.post(
            "/api/questionnaires/", {"region": "Казань", "duration_days": "1"}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        return response.json()["id"]

    def test_create_route_starts_generation(self):
        questionnaire_id = self.create_questionnaire()
        with mock.patch("app.views.generate_itinerary.delay") as delay:
            response = self.client.post(
                "/api/routes/", {"questionnaire": questionnaire_id, "title": "Маршрут: Казань"}, format="json"
            )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["status"], "pending")
        self.assertEqual(data["generator"], "catalog")
        self.assertEqual(data["places"], [])
        delay.assert_called_once_with(data["id"])

    def test_route_detail_and_status_after_generation(self):
        questionnaire_id = self.create_questionnaire()
        with mock.patch("app.views.generate_itinerary.delay"):
            route_id = self.client.post("/api/routes/", {"questionnaire": questionnaire_id}, format="json").json()["id"]
        generate_itinerary(route_id)

        detail = self.client.get(f"/api/routes/{route_id}/").json()
        self.assertEqual(detail["status"], "ready")
        self.assertEqual(detail["places"][0]["place"]["name"], "Кремль")
        self.assertEqual(detail["places"][0]["day_number"], 1)

        status = self.client.get(f"/api/routes/{route_id}/status/").json()
        self.assertEqual(status["status"], "ready")
        self.assertEqual(status["generator"], "catalog")
        self.assertIn("Кремль", status["full_text"])

    def test_cannot_use_foreign_questionnaire(self):
        foreign = Questionnaire.objects.create(user=self.other, region="Казань")
        with mock.patch("app.views.generate_itinerary.delay") as delay:
            response = self.client.post("/api/routes/", {"questionnaire": foreign.id}, format="json")
        self.assertEqual(response.status_code, 400)
        delay.assert_not_called()

    def test_questionnaire_is_required(self):
        with mock.patch("app.views.generate_itinerary.delay"):
            response = self.client.post("/api/routes/", {"title": "Без анкеты"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_cannot_review_foreign_route(self):
        foreign_route = Generated_Route.objects.create(user=self.other)
        response = self.client.post(
            "/api/reviews/", {"generated_route": foreign_route.id, "text": "Отлично", "rating": 5}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_review_own_route(self):
        route = Generated_Route.objects.create(user=self.user)
        response = self.client.post(
            "/api/reviews/", {"generated_route": route.id, "text": "Отлично", "rating": 5}, format="json"
        )
        self.assertEqual(response.status_code, 201)

    def test_routes_of_other_users_are_hidden(self):
        Generated_Route.objects.create(user=self.other, title="Чужой")
        self.assertEqual(self.client.get("/api/routes/").json()["count"], 0)

    def test_filter_places_by_region(self):
        anonymous = APIClient()
        found = anonymous.get("/api/filter-places/", {"region": "Татар"}).json()
        self.assertEqual([p["name"] for p in found], ["Кремль"])
        self.assertEqual(anonymous.get("/api/filter-places/", {"region": "Сибирь"}).json(), [])
