# Родной Код

Персональные культурные маршруты по регионам России. Пользователь заполняет анкету
о своих интересах и формате поездки — сервис подбирает маршрут из каталога мест
и собирает его в готовый план на несколько дней.

Места для маршрута подбираются из каталога проверенных объектов, а текст
маршрута и заметки к каждому месту пишет **OpenAI** — если задан ключ API.
Без ключа сервис полностью работает: маршрут собирается по каталогу и
получает понятное описание по дням (см. [Генерация маршрута и OpenAI](#генерация-маршрута-и-openai)).

---

## Содержание

- [Стек технологий](#стек-технологий)
- [Архитектура](#архитектура)
- [Генерация маршрута и OpenAI](#генерация-маршрута-и-openai)
- [Структура репозитория](#структура-репозитория)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [API](#api)
- [Модель данных](#модель-данных)
- [Разработка](#разработка)
- [Безопасность](#безопасность)
- [Дорожная карта](#дорожная-карта)

---

## Стек технологий

**Backend**
- Python 3.12, Django 5, Django REST Framework
- PostgreSQL — основная база данных
- Redis + Celery — асинхронная генерация маршрутов
- JWT (`djangorestframework-simplejwt`) — авторизация
- OpenAI Chat Completions API — текст маршрута и заметки к местам (по желанию)

**Frontend**
- React 19, Vite
- React Router 7 — маршрутизация
- Axios — HTTP-клиент с автообновлением JWT

**Инфраструктура**
- Docker / Docker Compose — единая среда для всех сервисов

---

## Архитектура

```mermaid
flowchart LR
    subgraph Client
        FE[React + Vite<br/>frontend]
    end

    subgraph Server
        API[Django REST Framework<br/>backend]
        Worker[Celery worker<br/>генерация маршрута]
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end

    subgraph External
        OpenAI[OpenAI API]
    end

    FE -- "REST + JWT" --> API
    API -- "чтение/запись" --> DB
    API -- "ставит задачу" --> Cache
    Worker -- "забирает задачу" --> Cache
    Worker -- "пишет результат" --> DB
    Worker -. "текст маршрута,<br/>если задан ключ" .-> OpenAI
```

Создание маршрута не блокирует запрос пользователя: `POST /api/routes/` сразу
возвращает объект со статусом `pending`, а сама генерация происходит в фоне
через Celery. Фронтенд опрашивает `GET /api/routes/{id}/status/`, пока статус
не сменится на `ready` или `failed`.

---

## Генерация маршрута и OpenAI

Маршрут собирает Celery-задача `generate_itinerary` (`backend/app/tasks.py`):

1. **Подбор мест.** Из каталога `Place` берутся места по региону или городу из анкеты,
   затем — по интересам (поле `tags`). Если подходящих мест меньше трёх, добавляются
   популярные места региона (`is_popular`, затем по рейтингу). Всего до 15 мест.
2. **Раскладка по дням.** Число дней берётся из анкеты (`duration_days`, от 1 до 7,
   по умолчанию 3), места распределяются по дням равномерно.
3. **Текст маршрута.**
   - **Задан `OPENAI_API_KEY`** — анкета и список мест отправляются в OpenAI
     (`backend/app/openai_client.py`). Модель возвращает JSON: название маршрута,
     план поездки по дням и заметку к каждому месту. Модели запрещено выдумывать места,
     адреса и цены; заметки к местам не из списка отбрасываются.
   - **Ключа нет или OpenAI недоступен** — маршрут собирается по каталогу:
     «Маршрут: Казань на 2 дня. День 1: …». Генерация при этом не падает.
4. **Результат.** У маршрута статус `ready` и поле `generator`: `openai` или `catalog`.
   На странице маршрута это видно по значку «Составлен ИИ (OpenAI)» или «Подбор по каталогу».

Чтобы включить ИИ, впишите ключ в `.env` и перезапустите сервисы:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Клиент работает через стандартную библиотеку Python, отдельный пакет не нужен.
Подойдёт любой OpenAI-совместимый сервис — укажите его адрес в `OPENAI_BASE_URL`.

> Ключ хранится только на сервере (backend и Celery) и никогда не попадает во frontend.
> В OpenAI уходят ответы анкеты и описания мест — персональные данные пользователя
> (имя, почта, телефон) не передаются.

---

## Структура репозитория

```
rodnoy-code/
├── backend/
│   ├── app/                  # основное Django-приложение
│   │   ├── models.py         # User, Questionnaire, Place, Generated_Route, Review...
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── tasks.py          # Celery-задача generate_itinerary: подбор мест и текст маршрута
│   │   ├── openai_client.py  # запрос к OpenAI Chat Completions
│   │   ├── tests.py          # тесты генерации и API
│   │   └── urls.py
│   ├── rodnoycode/           # настройки Django-проекта
│   │   ├── settings.py
│   │   ├── celery.py
│   │   └── urls.py
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # обёртки над каждым эндпоинтом backend
│   │   ├── context/           # AuthContext
│   │   ├── components/        # Header, Footer, ProtectedRoute, StatusBadge, GeneratorBadge
│   │   ├── pages/             # Landing, Register, Login, Questionnaire,
│   │   │                      # MyRoutes, RouteDetail, Profile, NotFound
│   │   └── styles/            # global.css
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Быстрый старт

### Требования

- Docker и Docker Compose
- Node.js 20+ (нужен только если запускаете frontend вне Docker)

### 1. Клонируйте репозиторий и настройте окружение

```bash
git clone <ссылка-на-репозиторий>
cd rodnoy-code
cp .env.example .env
```

Откройте `.env` и задайте свои значения — как минимум `DJANGO_SECRET_KEY` и `DB_PASSWORD`
(см. [Переменные окружения](#переменные-окружения)). Для генерации текста через ИИ
добавьте `OPENAI_API_KEY` — без него всё тоже работает.

Если backend будет не на `http://localhost:8000`, создайте `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. Запустите все сервисы

```bash
docker compose up --build
```

Поднимутся: PostgreSQL, Redis, Django backend, Celery worker, React frontend.

### 3. Накатите миграции и создайте администратора

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 4. Откройте приложение

| Сервис            | Адрес                          |
|-------------------|--------------------------------|
| Frontend          | http://localhost:5173          |
| Backend API       | http://localhost:8000/api/     |
| Django admin      | http://localhost:8000/admin/   |

Чтобы генерация маршрутов работала не вхолостую, добавьте через `/admin/`
несколько записей `Place`: заполните `region` и `city`, а в `tags` укажите интересы
из анкеты, например `["история", "архитектура"]`. Отметьте `is_popular` у главных мест региона.

---

## Переменные окружения

### Корень проекта (`.env`) — backend и docker-compose

| Переменная            | Назначение                                  | Пример                  |
|-----------------------|----------------------------------------------|--------------------------|
| `DJANGO_SECRET_KEY`   | Секретный ключ Django (обязателен)          | сгенерировать случайно  |
| `DEBUG`               | Режим отладки (`0` на проде!)                | `0` / `1`                |
| `DB_NAME`             | Имя базы PostgreSQL                          | `rodnoy_db`              |
| `DB_USER`             | Пользователь PostgreSQL                      | `rodnoy_user`            |
| `DB_PASSWORD`         | Пароль PostgreSQL (обязателен)                | сгенерировать случайно  |
| `DB_HOST`             | Хост базы данных                             | `db`                      |
| `DB_PORT`             | Порт базы данных                             | `5432`                    |
| `REDIS_HOST`          | Хост Redis                                    | `redis`                  |
| `REDIS_PORT`          | Порт Redis                                    | `6379`                    |
| `ALLOWED_HOSTS`       | Разрешённые хосты Django (через запятую)     | `localhost,127.0.0.1`    |
| `OPENAI_API_KEY`      | Ключ OpenAI; пусто — маршрут по каталогу     | `sk-...`                 |
| `OPENAI_MODEL`        | Модель OpenAI                                 | `gpt-4o-mini`            |
| `OPENAI_BASE_URL`     | Адрес API, можно OpenAI-совместимый           | `https://api.openai.com/v1` |
| `OPENAI_TIMEOUT`      | Таймаут запроса к OpenAI, секунд              | `60`                      |

### `frontend/.env`

| Переменная            | Назначение                                          | Пример                            |
|-----------------------|-------------------------------------------------------|-------------------------------------|
| `VITE_API_BASE_URL`   | Адрес backend API, доступный из браузера              | `http://localhost:8000/api`         |

Полный шаблон корневого файла — в `.env.example`. Реальные `.env`-файлы
**никогда не коммитятся** — они в `.gitignore`.

---

## API

Базовый префикс: `/api/`. Авторизация — JWT (`Authorization: Bearer <access>`).

| Метод | Путь                          | Доступ           | Описание                                   |
|-------|-------------------------------|-------------------|---------------------------------------------|
| POST  | `/register/`                  | Открытый          | Регистрация, возвращает пару JWT-токенов    |
| POST  | `/token/`                     | Открытый          | Вход, возвращает пару JWT-токенов           |
| POST  | `/token/refresh/`              | Открытый          | Обновление access-токена                    |
| GET   | `/profile/`                   | Авторизован       | Данные текущего пользователя                |
| PATCH | `/profile/`                   | Авторизован       | Обновление профиля                           |
| GET/POST | `/questionnaires/`          | Авторизован       | Список/создание своих анкет                  |
| GET/POST | `/routes/`                  | Авторизован       | Список/создание своих маршрутов; при создании нужен `questionnaire` — id своей анкеты |
| GET   | `/routes/{id}/`               | Авторизован (владелец) | Детали маршрута с местами по дням       |
| GET   | `/routes/{id}/status/`        | Авторизован (владелец) | Статус генерации (`pending/ready/failed`) и `generator` |
| GET   | `/places/`                     | Открытый          | Каталог мест (пагинация)                     |
| GET   | `/filter-places/`              | Открытый          | Фильтр мест по региону/интересу              |
| GET/POST | `/reviews/`                  | Авторизован       | Список/создание своих отзывов                |

Списковые эндпоинты используют пагинацию DRF — ответ приходит в виде
`{ "count": ..., "next": ..., "previous": ..., "results": [...] }`.

---

## Модель данных

```mermaid
erDiagram
    User ||--o{ Questionnaire : заполняет
    User ||--o{ Generated_Route : владеет
    User ||--o{ Review : оставляет
    Questionnaire ||--o| Generated_Route : "основа для"
    Generated_Route ||--o{ Generated_Route_Place : содержит
    Place ||--o{ Generated_Route_Place : "используется в"
    Generated_Route ||--o{ Review : получает
```

---

## Разработка

### Ветвление и Pull Request

- `main` — всегда стабильная ветка, прямые пуши в неё закрыты.
- Новая задача — новая ветка от актуального `main`: `feature/...`, `fix/...`.
- Изменения проходят через Pull Request с ревью перед мержем.

### Полезные команды

```bash
# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f celery

# Миграции после изменения models.py
docker compose exec backend python manage.py makemigrations app
docker compose exec backend python manage.py migrate

# Django shell
docker compose exec backend python manage.py shell

# Прогнать проверки Django и тесты перед коммитом
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test app
```

### Frontend отдельно от Docker (быстрее для правки UI)

```bash
cd frontend
npm install
npm run dev
```
Backend при этом всё равно должен быть поднят (`docker compose up db redis backend celery`).

---

## Безопасность

- Все чувствительные данные — только в `.env`, никогда не коммитятся.
- JWT-токены живут ограниченное время, обновление — через refresh-токен.
- Владение объектами (анкеты, маршруты, отзывы) проверяется на уровне
  сериализаторов и `get_queryset()` — пользователь не может прочитать
  или изменить чужие данные (защита от IDOR).
- `DEBUG=0` и реальный `DJANGO_SECRET_KEY` обязательны при любом деплое
  за пределами локальной машины.

Если находите уязвимость — не создавайте публичный issue, сообщите напрямую
кому-то из команды.

---

## Дорожная карта

- [x] Регистрация, JWT-авторизация
- [x] Анкета и алгоритмический подбор маршрута
- [x] Асинхронная генерация через Celery
- [x] Фронтенд на React с полной интеграцией API
- [x] Генерация текста маршрута через OpenAI поверх каталога `Place`
- [ ] Загрузка фото к отзывам через интерфейс
- [ ] Production-конфигурация (Gunicorn, non-root контейнеры, HTTPS)
- [x] Автотесты backend: генерация маршрута, OpenAI, права доступа
- [ ] Автотесты frontend + CI

---

## Лицензия

Проект пока без публичной лицензии — все права защищены авторами проекта.
