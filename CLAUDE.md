# ER Database Generator — CLAUDE.md

## Что это

AI-инструмент для проектирования баз данных через чат. Пользователь описывает предметную область, GPT-4o генерирует ER-диаграмму с SQL-кодом. Диаграмма отображается интерактивно через @xyflow/react.

**Backend:** Django 4.2 + DRF + PostgreSQL + OpenAI + GitHub OAuth + JWT  
**Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Zustand  
**AI:** GPT-4o (через OpenAI API)

---

## Архитектура

```
ERDatabase/
├── backend/           # Django REST API (порт 8000)
│   ├── core/          # Настройки Django, root urls
│   ├── er_generator/  # Основное приложение
│   │   ├── models.py           # Chat, Message (UUID PK, JSONField er_data)
│   │   ├── views.py            # Chat CRUD + send message (async)
│   │   ├── auth_views.py       # GitHub OAuth + dev-login + JWT verify
│   │   ├── authentication.py   # Кастомный JWTAuthentication для DRF
│   │   ├── serializers.py      # DRF сериализаторы
│   │   └── services/
│   │       └── openai_service.py  # Вся логика вызовов OpenAI
│   └── prompts/
│       └── system_prompt.txt   # ⚠️ СИСТЕМНЫЙ ПРОМПТ — см. раздел "Нельзя трогать"
│
└── front/             # Next.js приложение (порт 3000)
    └── src/
        ├── app/           # Next.js App Router
        ├── components/    # chat/, er-diagram/, ui/
        ├── lib/api.ts     # Axios клиент с JWT интерцептором
        ├── store/         # Zustand store
        └── types/         # TypeScript интерфейсы
```

### Data flow

1. Пользователь логинится через GitHub OAuth или dev-login (DEBUG=True)
2. JWT токен хранится в `localStorage`
3. Создаётся чат, пользователь отправляет сообщение + выбирает SQL диалект
4. `views.py` → `openai_service.py` → GPT-4o с системным промптом
5. GPT-4o возвращает JSON: `{message, er_data: {nodes, edges}, sql}`
6. `er_data` и `sql` сохраняются в `Message.er_data` / `Message.sql`
7. Frontend рендерит ER-диаграмму через `@xyflow/react`

---

## Команды

### Backend

```bash
# Из корня проекта
cd backend

# Установить зависимости
pip install -r ../requirements.txt

# Применить миграции
python manage.py migrate

# Запустить dev-сервер (порт 8000)
python manage.py runserver

# Создать суперпользователя
python manage.py createsuperuser

# Создать миграции после изменения models.py
python manage.py makemigrations

# Django shell для отладки
python manage.py shell

# Запустить тесты
python manage.py test er_generator
```

### Frontend

```bash
# Из директории front/
cd front

# Установить зависимости
npm install

# Dev-сервер (порт 3000, с hot reload)
npm run dev

# Продакшн-билд
npm run build

# Запустить продакшн-билд
npm start

# Линтинг
npm run lint
```

### API документация

- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- OpenAPI schema: http://localhost:8000/api/schema/

---

## Конвенции кода

### Python / Django

- **Python версия:** 3.10+
- **Стиль:** PEP8, строки до 120 символов
- **Async views:** Использовать `adrf` (`from adrf.views import APIView`) для async/await в DRF views
- **Сериализаторы:** Отдельные сериализаторы для List/Detail/Create/Update операций
- **UUID:** Все модели используют UUID primary key
- **Аутентификация:** JWT через кастомный `JWTAuthentication` класс, НЕ использовать сторонние JWT пакеты
- **Переменные окружения:** Все секреты через `os.environ.get()` в `settings.py`, никаких хардкодов
- **Именование:** snake_case для всего Python кода

### TypeScript / React

- **Строгие типы:** `strict: true` в tsconfig, никаких `any` без крайней необходимости
- **Интерфейсы:** Все типы описаны в `front/src/types/index.ts`
- **State management:** Zustand store в `front/src/store/useStore.ts`
- **API вызовы:** Только через `front/src/lib/api.ts`, никаких прямых fetch/axios вне этого файла
- **Компоненты:** `'use client'` только там, где нужна интерактивность
- **Именование:** PascalCase для компонентов, camelCase для функций/переменных

### Структура API ответов

Ответ OpenAI всегда возвращает JSON вида:
```json
{
  "message": "string",
  "er_data": {
    "nodes": [...],
    "edges": [...]
  },
  "sql": "string"
}
```
Нода (таблица) всегда содержит `id`, `type: "tableNode"`, `position: {x, y}`, `data: {tableName, columns}`.

---

## ⚠️ Нельзя трогать

| Файл / Область | Причина |
|---|---|
| `backend/prompts/system_prompt.txt` | Тщательно откалиброванный системный промпт — изменения могут сломать формат er_data/sql. Изменять только после тестирования |
| `backend/er_generator/authentication.py` | JWT auth логика — изменения сломают все защищённые эндпоинты |
| `backend/er_generator/migrations/` | Никогда не редактировать вручную. Только через `makemigrations` |
| Структура `er_data` (nodes/edges) | Frontend (@xyflow/react) ожидает строгий формат. Изменения требуют синхронного обновления frontend |
| `Message.er_data` JSONField структура | Исторические данные в БД сломаются при изменении схемы |

---

## Переменные окружения

Файл `.env` в корне проекта (НЕ коммитить!):

```env
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

DB_NAME=erdatabase
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=random-secret-for-jwt
```

**⚠️ КРИТИЧЕСКИ ВАЖНО:** Текущий `.env` с реальными ключами попал в git. Необходимо:
1. Немедленно сменить OpenAI API key на platform.openai.com
2. Сменить GitHub OAuth secret в настройках GitHub App
3. Добавить `.env` в `.gitignore` (уже добавлен — но файл уже затрекан, нужно `git rm --cached .env`)

---

## Известные особенности

- **dev-login:** Эндпоинт `/api/auth/dev-login/` работает только при `DEBUG=True`. Создаёт тестового пользователя без пароля
- **Async:** `openai_service.py` использует `asyncio` с `run_coroutine_threadsafe` для совместимости с sync и async Django views
- **SQL диалекты:** PostgreSQL, MySQL, SQLite, SQL Server, Oracle — выбирается при отправке сообщения
- **Позиционирование нод:** GPT-4o генерирует координаты кратными 200 для равномерного расположения
- **1.py** в корне — посторонний GIS-скрипт, не относится к проекту (можно удалить)
