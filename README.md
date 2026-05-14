# ER Database Generator

AI-инструмент для проектирования баз данных через чат. Пользователь на естественном языке описывает предметную область — GPT-4o возвращает интерактивную ER-диаграмму и готовый SQL-код на выбранном диалекте.

## Стек

**Backend:** Django 4.2 · Django REST Framework · `adrf` (async views) · PostgreSQL · OpenAI API · JWT (кастомная реализация на PyJWT) · drf-spectacular

**Frontend:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zustand · [@xyflow/react](https://reactflow.dev/) · Axios

**AI:** GPT-4o

## Возможности

- Чаты с историей сообщений и сгенерированными диаграммами
- Интерактивная ER-диаграмма (перетаскивание нод, отношения, экспорт в PNG через `html-to-image`)
- Генерация SQL в 5 диалектах: **PostgreSQL, MySQL, SQLite, SQL Server, Oracle**
- Библиотека сохранённых схем с тегами и экспортом `.sql`
- Авторегенерация заголовка чата по содержимому
- Email-регистрация с подтверждением + JWT-сессии

## Структура репозитория

```
ERDatabase/
├── backend/                      # Django REST API (порт 8000)
│   ├── core/                     # settings.py, root urls
│   ├── er_generator/
│   │   ├── models.py             # User, UserProfile, Chat, Message, Tag, SavedSchema
│   │   ├── views.py              # Chat/Message/Schema/Tag CRUD (async via adrf)
│   │   ├── auth_views.py         # register / login / verify-email / me
│   │   ├── authentication.py     # Кастомный JWTAuthentication
│   │   ├── serializers.py
│   │   └── services/openai_service.py
│   └── prompts/system_prompt.txt # ⚠️ откалиброванный системный промпт
│
├── front/                        # Next.js (порт 3000)
│   └── src/
│       ├── app/                  # App Router страницы
│       ├── components/           # chat/, er-diagram/, ui/
│       ├── lib/api.ts            # Axios + JWT interceptor
│       ├── store/useStore.ts     # Zustand store
│       └── types/index.ts
│
├── requirements.txt              # Python-зависимости
└── CLAUDE.md                     # Инструкции для AI-агента
```

## Быстрый старт

### 1. Предварительные требования

- Python 3.10+
- Node.js 20+
- PostgreSQL 14+
- OpenAI API ключ

### 2. Переменные окружения

Создайте `.env` в корне проекта:

```env
DEBUG=True
SECRET_KEY=<случайная-строка>

DB_NAME=erdatabase
DB_USER=postgres
DB_PASSWORD=<пароль>
DB_HOST=localhost
DB_PORT=5432

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

JWT_SECRET=<случайная-строка>
```

> ⚠️ `.env` **не должен** попадать в git. Если уже закоммичен — `git rm --cached .env` и ротация всех ключей.

### 3. Backend

```bash
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

API поднимется на `http://localhost:8000`.

### 4. Frontend

```bash
cd front
npm install
npm run dev
```

UI откроется на `http://localhost:3000`.

## API

| Категория | Эндпоинт |
|---|---|
| Auth | `POST /api/auth/register/` · `POST /api/auth/login/` · `POST /api/auth/logout/` · `POST /api/auth/verify/` · `POST /api/auth/verify-email/` · `POST /api/auth/resend-verification/` · `GET /api/auth/me/` |
| Чаты | `GET/POST /api/chats/` · `GET/PATCH/DELETE /api/chats/<uuid>/` · `POST /api/chats/<uuid>/generate-title/` |
| Сообщения | `POST /api/chats/<uuid>/messages/` |
| Схемы | `GET/POST /api/schemas/` · `GET/PATCH/DELETE /api/schemas/<uuid>/` · `GET /api/schemas/<uuid>/export/` |
| Теги | `GET/POST /api/tags/` · `GET/PATCH/DELETE /api/tags/<uuid>/` |

**Документация:**
- Swagger UI — [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- ReDoc — [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)
- OpenAPI schema — [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)

## Data flow

1. Пользователь логинится → JWT сохраняется в `localStorage`
2. Создаёт чат, отправляет сообщение + выбирает SQL-диалект
3. [views.py](backend/er_generator/views.py) → [services/openai_service.py](backend/er_generator/services/openai_service.py) → GPT-4o с системным промптом из [prompts/system_prompt.txt](backend/prompts/system_prompt.txt)
4. Модель возвращает JSON:
   ```json
   {
     "message": "string",
     "er_data": { "nodes": [...], "edges": [...] },
     "sql": "string"
   }
   ```
5. `er_data` и `sql` сохраняются в `Message` (JSONField)
6. Frontend рендерит диаграмму через `@xyflow/react`

Формат ноды: `{ id, type: "tableNode", position: {x, y}, data: { tableName, columns } }`.

## Конвенции

**Python.** PEP8, строки ≤120; UUID PK на всех моделях; async views через `adrf.views.APIView`; секреты только через `os.environ.get()`; JWT — **только** встроенный [authentication.py](backend/er_generator/authentication.py), без сторонних пакетов.

**TypeScript.** `strict: true`, никакого `any` без причины; все типы в [front/src/types/index.ts](front/src/types/index.ts); API-запросы — только через [front/src/lib/api.ts](front/src/lib/api.ts); Zustand-стор — [front/src/store/useStore.ts](front/src/store/useStore.ts); `'use client'` — только где нужно.

## Что нельзя трогать

| Файл | Причина |
|---|---|
| [backend/prompts/system_prompt.txt](backend/prompts/system_prompt.txt) | Промпт откалиброван — любые правки могут сломать формат `er_data`/`sql` |
| [backend/er_generator/authentication.py](backend/er_generator/authentication.py) | JWT-логика, от неё зависят все защищённые эндпоинты |
| `backend/er_generator/migrations/` | Только через `makemigrations`, руками не править |
| Структура `er_data` (nodes/edges) | Жёстко связана с `@xyflow/react` и историческими данными в БД |

## Команды

```bash
# Backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py test er_generator
python manage.py shell

# Frontend
npm run dev       # dev-сервер с hot reload
npm run build     # прод-сборка
npm start         # запуск прод-сборки
npm run lint      # ESLint
```
