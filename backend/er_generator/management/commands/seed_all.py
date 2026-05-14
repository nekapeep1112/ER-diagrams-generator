"""Seed демо-данных, выровненных с front/src/lib/mocks/.

Создаёт:
  - 2 demo-юзера + 16 авторов из MOCK_TEMPLATES + 5 рандомных юзеров (Faker)
  - 53 системных тега (user=None) с цветами из MOCK_TAGS
  - 16 публичных шаблонов (1 канонический + 15 компактных)
  - 5 saved-схем для demo-юзера + ~30 рандомных у других
  - 3 заметки из MOCK_NOTES + ~50 рандомных
  - 5 чатов с 2-3 сообщениями каждый

Использование:
  python manage.py seed_all          # дополнить
  python manage.py seed_all --reset  # очистить и пересоздать
"""

import random
import uuid

from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import transaction

from er_generator.models import (
    Chat,
    Message,
    SavedSchema,
    SchemaTemplate,
    Tag,
    TableNote,
    User,
    UserProfile,
)


# ─────────────────────────────────────────────────────────
# 1. Системные теги (53 штуки) — копия из front/src/lib/mocks/tags.ts
# ─────────────────────────────────────────────────────────

TAG_COLORS = ['#06b6d4', '#a855f7', '#4ade80', '#facc15', '#f43f5e']
TAG_NAMES = [
    'billing', 'subscriptions', 'saas',
    'retail', 'cart', 'shop', 'orders', 'payments', 'auth',
    'blog', 'content', 'comments', 'tags',
    'education', 'courses', 'students',
    'social', 'feed', 'follows',
    'pos', 'staff',
    'healthcare', 'patients', 'appointments',
    'events', 'metrics', 'users',
    'forum', 'threads', 'karma',
    'inventory', 'stock', 'suppliers',
    'booking', 'calendar', 'resources',
    'crm', 'leads', 'deals', 'sales',
    'property', 'listings', 'agents',
    'iot', 'timeseries', 'devices',
    'music', 'playlists', 'artists',
    'tasks', 'projects', 'kanban',
]


# ─────────────────────────────────────────────────────────
# 2. Авторы шаблонов — копия из MOCK_TEMPLATES.AUTHORS
# (handle, plan)
# ─────────────────────────────────────────────────────────

AUTHORS_DATA = [
    ('alex.dev',  'pro'),
    ('maria.r',   'pro'),
    ('dev_anon',  'free'),
    ('tweet.dev', 'pro'),
    ('anna.k',    'free'),
    ('chef_db',   'pro'),
    ('med_pro',   'pro'),
    ('data.eng',  'pro'),
    ('gopher',    'free'),
    ('warehouse', 'pro'),
    ('book.dev',  'pro'),
    ('sales.pro', 'pro'),
    ('realtor',   'pro'),
    ('iot_lab',   'pro'),
    ('audio.dev', 'pro'),
    ('pm.tool',   'pro'),
]


# ─────────────────────────────────────────────────────────
# 3. Канонический шаблон «Биллинг SaaS» (5 таблиц / 4 связи)
# ─────────────────────────────────────────────────────────

def _col(name, type_, pk=False, fk=False, ref=None):
    return {'name': name, 'type': type_, 'isPrimary': pk, 'isForeign': fk, 'references': ref}


def _node(id_, x, y, columns):
    return {'id': id_, 'type': 'tableNode', 'position': {'x': x, 'y': y},
            'data': {'tableName': id_, 'columns': columns}}


def _edge(id_, src, tgt, src_h, tgt_h, label='1:N'):
    return {'id': id_, 'source': src, 'target': tgt,
            'sourceHandle': src_h, 'targetHandle': tgt_h,
            'type': 'smoothstep', 'animated': True, 'label': label}


BILLING_SAAS_ER = {
    'nodes': [
        _node('workspaces', 0, 0, [
            _col('id', 'UUID', pk=True),
            _col('name', 'VARCHAR(120)'),
            _col('plan', 'VARCHAR(20)'),
            _col('created_at', 'TIMESTAMPTZ'),
        ]),
        _node('users', 400, 0, [
            _col('id', 'UUID', pk=True),
            _col('workspace_id', 'UUID', fk=True, ref='workspaces.id'),
            _col('email', 'VARCHAR(255)'),
            _col('role', 'VARCHAR(20)'),
        ]),
        _node('subscriptions', 0, 200, [
            _col('id', 'UUID', pk=True),
            _col('workspace_id', 'UUID', fk=True, ref='workspaces.id'),
            _col('status', 'VARCHAR(20)'),
            _col('renews_at', 'TIMESTAMPTZ'),
            _col('trial_ends_at', 'TIMESTAMPTZ'),
        ]),
        _node('invoices', 400, 200, [
            _col('id', 'UUID', pk=True),
            _col('sub_id', 'UUID', fk=True, ref='subscriptions.id'),
            _col('total', 'NUMERIC(10,2)'),
            _col('status', 'VARCHAR(20)'),
            _col('issued_at', 'TIMESTAMPTZ'),
        ]),
        _node('line_items', 200, 400, [
            _col('id', 'UUID', pk=True),
            _col('invoice_id', 'UUID', fk=True, ref='invoices.id'),
            _col('amount', 'NUMERIC(10,2)'),
            _col('qty', 'INTEGER'),
        ]),
    ],
    'edges': [
        _edge('e-ws-users', 'users', 'workspaces', 'workspace_id', 'id'),
        _edge('e-ws-subs', 'subscriptions', 'workspaces', 'workspace_id', 'id'),
        _edge('e-subs-inv', 'invoices', 'subscriptions', 'sub_id', 'id'),
        _edge('e-inv-li', 'line_items', 'invoices', 'invoice_id', 'id'),
    ],
}

BILLING_SAAS_SQL = """-- Сгенерировано ER Database · диалект PostgreSQL
-- 5 таблиц · 4 связи

CREATE TABLE workspaces (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(120) NOT NULL,
  plan         VARCHAR(20) NOT NULL DEFAULT 'free',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email        VARCHAR(255) NOT NULL UNIQUE,
  role         VARCHAR(20) NOT NULL DEFAULT 'member'
);

CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status        VARCHAR(20) NOT NULL DEFAULT 'trialing',
  renews_at     TIMESTAMPTZ NOT NULL,
  trial_ends_at TIMESTAMPTZ
);

CREATE TABLE invoices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_id       UUID NOT NULL REFERENCES subscriptions(id),
  total        NUMERIC(10,2) NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'draft',
  issued_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE line_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount       NUMERIC(10,2) NOT NULL,
  qty          INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_users_workspace ON users(workspace_id);
CREATE INDEX idx_invoices_sub ON invoices(sub_id);
"""


def _mini_er(defs, edges):
    """Аналог miniERA() из templates.ts — компактный ER из 2-4 таблиц."""
    nodes = []
    for i, d in enumerate(defs):
        cols = []
        for c in d['cols']:
            name, type_ = c[0], c[1]
            kind = c[2] if len(c) > 2 else None
            ref = c[3] if len(c) > 3 else None
            cols.append(_col(name, type_, pk=(kind == 'pk'),
                              fk=(kind == 'fk'), ref=ref))
        nodes.append(_node(d['name'], (i % 2) * 400, (i // 2) * 200, cols))
    er_edges = [_edge(f'e-{i}', src, tgt, src_h, tgt_h)
                for i, (src, tgt, src_h, tgt_h) in enumerate(edges)]
    return {'nodes': nodes, 'edges': er_edges}


# ─────────────────────────────────────────────────────────
# 4. 16 шаблонов (зеркало MOCK_TEMPLATES)
# ─────────────────────────────────────────────────────────

def _build_templates():
    """Возвращает list dict-ов с данными всех 16 шаблонов."""
    return [
        {
            'name': 'Интернет-магазин', 'category': 'E-commerce', 'fork_count': 1284,
            'author': 'alex.dev', 'tags': ['retail', 'cart', 'payments', 'auth'],
            'description': 'Каталог, корзина, заказы и интеграция со Stripe.',
            'er_data': _mini_er(
                [
                    {'name': 'users', 'cols': [('id', 'UUID', 'pk'), ('email', 'VARCHAR(255)')]},
                    {'name': 'products', 'cols': [('id', 'UUID', 'pk'), ('sku', 'VARCHAR(64)'), ('price', 'NUMERIC(10,2)')]},
                    {'name': 'orders', 'cols': [('id', 'UUID', 'pk'), ('user_id', 'UUID', 'fk', 'users.id'), ('total', 'NUMERIC(10,2)')]},
                ],
                [('orders', 'users', 'user_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR(255) UNIQUE);\n'
                'CREATE TABLE products (id UUID PRIMARY KEY, sku VARCHAR(64) UNIQUE, price NUMERIC(10,2) NOT NULL);\n'
                'CREATE TABLE orders (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), total NUMERIC(10,2) NOT NULL);'
            ),
            'created_at_iso': '2024-09-12T10:00:00Z',
        },
        {
            'name': 'Биллинг SaaS', 'category': 'SaaS', 'fork_count': 947,
            'author': 'maria.r', 'tags': ['billing', 'subscriptions'],
            'description': 'Workspaces, подписки, инвойсы и позиции с usage-tracking.',
            'er_data': BILLING_SAAS_ER, 'sql': BILLING_SAAS_SQL,
            'created_at_iso': '2024-10-08T10:00:00Z',
        },
        {
            'name': 'Блог с комментариями', 'category': 'CMS', 'fork_count': 892,
            'author': 'dev_anon', 'tags': ['content', 'comments', 'tags'],
            'description': 'Посты, категории, теги, ветки комментариев и роли пользователей.',
            'er_data': _mini_er(
                [
                    {'name': 'users', 'cols': [('id', 'UUID', 'pk'), ('email', 'VARCHAR(255)')]},
                    {'name': 'posts', 'cols': [('id', 'UUID', 'pk'), ('author_id', 'UUID', 'fk', 'users.id'), ('title', 'VARCHAR(255)')]},
                    {'name': 'comments', 'cols': [('id', 'UUID', 'pk'), ('post_id', 'UUID', 'fk', 'posts.id'), ('body', 'TEXT')]},
                ],
                [('posts', 'users', 'author_id', 'id'), ('comments', 'posts', 'post_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR(255) UNIQUE);\n'
                'CREATE TABLE posts (id UUID PRIMARY KEY, author_id UUID REFERENCES users(id), title VARCHAR(255), body TEXT);\n'
                'CREATE TABLE comments (id UUID PRIMARY KEY, post_id UUID REFERENCES posts(id), body TEXT, created_at TIMESTAMPTZ);'
            ),
            'created_at_iso': '2024-11-02T10:00:00Z',
        },
        {
            'name': 'Социальная сеть', 'category': 'Social', 'fork_count': 612,
            'author': 'tweet.dev', 'tags': ['social', 'feed', 'follows', 'auth'],
            'description': 'Пользователи, подписки, посты, лайки, репосты и треды ответов.',
            'er_data': _mini_er(
                [
                    {'name': 'users', 'cols': [('id', 'UUID', 'pk'), ('handle', 'VARCHAR(32)')]},
                    {'name': 'posts', 'cols': [('id', 'UUID', 'pk'), ('author_id', 'UUID', 'fk', 'users.id'), ('body', 'TEXT')]},
                    {'name': 'follows', 'cols': [('follower_id', 'UUID', 'fk', 'users.id'), ('followee_id', 'UUID', 'fk', 'users.id')]},
                    {'name': 'likes', 'cols': [('user_id', 'UUID', 'fk', 'users.id'), ('post_id', 'UUID', 'fk', 'posts.id')]},
                ],
                [('posts', 'users', 'author_id', 'id'), ('likes', 'posts', 'post_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE users (id UUID PRIMARY KEY, handle VARCHAR(32) UNIQUE);\n'
                'CREATE TABLE posts (id UUID PRIMARY KEY, author_id UUID REFERENCES users(id), body TEXT);\n'
                'CREATE TABLE follows (follower_id UUID, followee_id UUID, PRIMARY KEY (follower_id, followee_id));\n'
                'CREATE TABLE likes (user_id UUID, post_id UUID, PRIMARY KEY (user_id, post_id));'
            ),
            'created_at_iso': '2024-11-20T10:00:00Z',
        },
        {
            'name': 'Школьная LMS', 'category': 'Education', 'fork_count': 521,
            'author': 'anna.k', 'tags': ['education', 'courses', 'students'],
            'description': 'Курсы, студенты, зачисления, задания и выставление оценок.',
            'er_data': _mini_er(
                [
                    {'name': 'students', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                    {'name': 'courses', 'cols': [('id', 'UUID', 'pk'), ('title', 'VARCHAR(255)')]},
                    {'name': 'enrollments', 'cols': [('student_id', 'UUID', 'fk', 'students.id'), ('course_id', 'UUID', 'fk', 'courses.id')]},
                ],
                [('enrollments', 'students', 'student_id', 'id'), ('enrollments', 'courses', 'course_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE students (id UUID PRIMARY KEY, name VARCHAR(120), email VARCHAR(255));\n'
                'CREATE TABLE courses (id UUID PRIMARY KEY, title VARCHAR(255), instructor VARCHAR(120));\n'
                'CREATE TABLE enrollments (student_id UUID REFERENCES students(id), course_id UUID REFERENCES courses(id), grade SMALLINT);'
            ),
            'created_at_iso': '2024-12-01T10:00:00Z',
        },
        {
            'name': 'Касса ресторана', 'category': 'Finance', 'fork_count': 458,
            'author': 'chef_db', 'tags': ['pos', 'orders', 'staff', 'payments'],
            'description': 'Столики, меню, заказы, оплаты и учёт смен персонала.',
            'er_data': _mini_er(
                [
                    {'name': 'tables', 'cols': [('id', 'UUID', 'pk'), ('number', 'INTEGER')]},
                    {'name': 'menu_items', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)'), ('price', 'NUMERIC(10,2)')]},
                    {'name': 'orders', 'cols': [('id', 'UUID', 'pk'), ('table_id', 'UUID', 'fk', 'tables.id'), ('total', 'NUMERIC(10,2)')]},
                ],
                [('orders', 'tables', 'table_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE tables (id UUID PRIMARY KEY, number INTEGER UNIQUE);\n'
                'CREATE TABLE menu_items (id UUID PRIMARY KEY, name VARCHAR(120), price NUMERIC(10,2));\n'
                'CREATE TABLE orders (id UUID PRIMARY KEY, table_id UUID REFERENCES tables(id), total NUMERIC(10,2));'
            ),
            'created_at_iso': '2024-12-14T10:00:00Z',
        },
        {
            'name': 'Управление клиникой', 'category': 'Healthcare', 'fork_count': 387,
            'author': 'med_pro', 'tags': ['healthcare', 'patients', 'appointments'],
            'description': 'Пациенты, врачи, приёмы, рецепты и биллинг.',
            'er_data': _mini_er(
                [
                    {'name': 'patients', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)'), ('dob', 'DATE')]},
                    {'name': 'doctors', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                    {'name': 'appointments', 'cols': [('id', 'UUID', 'pk'), ('patient_id', 'UUID', 'fk', 'patients.id'), ('doctor_id', 'UUID', 'fk', 'doctors.id')]},
                ],
                [('appointments', 'patients', 'patient_id', 'id'), ('appointments', 'doctors', 'doctor_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE patients (id UUID PRIMARY KEY, name VARCHAR(120), dob DATE);\n'
                'CREATE TABLE doctors (id UUID PRIMARY KEY, name VARCHAR(120), speciality VARCHAR(120));\n'
                'CREATE TABLE appointments (id UUID PRIMARY KEY, patient_id UUID REFERENCES patients(id), doctor_id UUID REFERENCES doctors(id), scheduled_at TIMESTAMPTZ);'
            ),
            'created_at_iso': '2025-01-08T10:00:00Z',
        },
        {
            'name': 'Дашборд аналитики', 'category': 'Analytics', 'fork_count': 342,
            'author': 'data.eng', 'tags': ['events', 'metrics', 'users'],
            'description': 'Схема событий с time-series партиционированием.',
            'er_data': _mini_er(
                [
                    {'name': 'users', 'cols': [('id', 'UUID', 'pk'), ('anon_id', 'VARCHAR(64)')]},
                    {'name': 'events', 'cols': [('id', 'BIGINT', 'pk'), ('user_id', 'UUID', 'fk', 'users.id'), ('name', 'VARCHAR(64)'), ('occurred_at', 'TIMESTAMPTZ')]},
                ],
                [('events', 'users', 'user_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE users (id UUID PRIMARY KEY, anon_id VARCHAR(64) UNIQUE);\n'
                'CREATE TABLE events (id BIGSERIAL PRIMARY KEY, user_id UUID REFERENCES users(id), name VARCHAR(64), occurred_at TIMESTAMPTZ NOT NULL, payload JSONB);\n'
                'CREATE INDEX idx_events_occurred ON events(occurred_at);'
            ),
            'created_at_iso': '2025-01-22T10:00:00Z',
        },
        {
            'name': 'Форум', 'category': 'Social', 'fork_count': 298,
            'author': 'gopher', 'tags': ['forum', 'threads', 'karma'],
            'description': 'Разделы, ветки, посты, голосования и модераторские действия.',
            'er_data': _mini_er(
                [
                    {'name': 'boards', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                    {'name': 'threads', 'cols': [('id', 'UUID', 'pk'), ('board_id', 'UUID', 'fk', 'boards.id'), ('title', 'VARCHAR(255)')]},
                    {'name': 'posts', 'cols': [('id', 'UUID', 'pk'), ('thread_id', 'UUID', 'fk', 'threads.id'), ('body', 'TEXT')]},
                ],
                [('threads', 'boards', 'board_id', 'id'), ('posts', 'threads', 'thread_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE boards (id UUID PRIMARY KEY, name VARCHAR(120) UNIQUE);\n'
                'CREATE TABLE threads (id UUID PRIMARY KEY, board_id UUID REFERENCES boards(id), title VARCHAR(255));\n'
                'CREATE TABLE posts (id UUID PRIMARY KEY, thread_id UUID REFERENCES threads(id), body TEXT, created_at TIMESTAMPTZ);'
            ),
            'created_at_iso': '2025-02-05T10:00:00Z',
        },
        {
            'name': 'Складской учёт', 'category': 'E-commerce', 'fork_count': 276,
            'author': 'warehouse', 'tags': ['inventory', 'stock', 'suppliers'],
            'description': 'Товары, склады, остатки и заказы поставщикам.',
            'er_data': _mini_er(
                [
                    {'name': 'products', 'cols': [('id', 'UUID', 'pk'), ('sku', 'VARCHAR(64)')]},
                    {'name': 'warehouses', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                    {'name': 'stock', 'cols': [('product_id', 'UUID', 'fk', 'products.id'), ('warehouse_id', 'UUID', 'fk', 'warehouses.id'), ('qty', 'INTEGER')]},
                ],
                [('stock', 'products', 'product_id', 'id'), ('stock', 'warehouses', 'warehouse_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE products (id UUID PRIMARY KEY, sku VARCHAR(64) UNIQUE);\n'
                'CREATE TABLE warehouses (id UUID PRIMARY KEY, name VARCHAR(120));\n'
                'CREATE TABLE stock (product_id UUID REFERENCES products(id), warehouse_id UUID REFERENCES warehouses(id), qty INTEGER NOT NULL, PRIMARY KEY (product_id, warehouse_id));'
            ),
            'created_at_iso': '2025-02-19T10:00:00Z',
        },
        {
            'name': 'Бронирование', 'category': 'SaaS', 'fork_count': 254,
            'author': 'book.dev', 'tags': ['booking', 'calendar', 'resources'],
            'description': 'Ресурсы, тайм-слоты, бронирования и регулярная доступность.',
            'er_data': _mini_er(
                [
                    {'name': 'resources', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                    {'name': 'slots', 'cols': [('id', 'UUID', 'pk'), ('resource_id', 'UUID', 'fk', 'resources.id'), ('starts_at', 'TIMESTAMPTZ')]},
                    {'name': 'bookings', 'cols': [('id', 'UUID', 'pk'), ('slot_id', 'UUID', 'fk', 'slots.id'), ('user_email', 'VARCHAR(255)')]},
                ],
                [('slots', 'resources', 'resource_id', 'id'), ('bookings', 'slots', 'slot_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE resources (id UUID PRIMARY KEY, name VARCHAR(120));\n'
                'CREATE TABLE slots (id UUID PRIMARY KEY, resource_id UUID REFERENCES resources(id), starts_at TIMESTAMPTZ, duration_min INTEGER);\n'
                'CREATE TABLE bookings (id UUID PRIMARY KEY, slot_id UUID REFERENCES slots(id), user_email VARCHAR(255));'
            ),
            'created_at_iso': '2025-03-03T10:00:00Z',
        },
        {
            'name': 'CRM с воронкой', 'category': 'SaaS', 'fork_count': 231,
            'author': 'sales.pro', 'tags': ['crm', 'leads', 'deals'],
            'description': 'Компании, контакты, лиды, сделки и стадии воронки.',
            'er_data': _mini_er(
                [
                    {'name': 'companies', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(255)')]},
                    {'name': 'contacts', 'cols': [('id', 'UUID', 'pk'), ('company_id', 'UUID', 'fk', 'companies.id'), ('email', 'VARCHAR(255)')]},
                    {'name': 'deals', 'cols': [('id', 'UUID', 'pk'), ('contact_id', 'UUID', 'fk', 'contacts.id'), ('amount', 'NUMERIC(12,2)')]},
                ],
                [('contacts', 'companies', 'company_id', 'id'), ('deals', 'contacts', 'contact_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE companies (id UUID PRIMARY KEY, name VARCHAR(255));\n'
                'CREATE TABLE contacts (id UUID PRIMARY KEY, company_id UUID REFERENCES companies(id), email VARCHAR(255));\n'
                'CREATE TABLE deals (id UUID PRIMARY KEY, contact_id UUID REFERENCES contacts(id), amount NUMERIC(12,2), stage VARCHAR(40));'
            ),
            'created_at_iso': '2025-03-15T10:00:00Z',
        },
        {
            'name': 'Недвижимость', 'category': 'Finance', 'fork_count': 198,
            'author': 'realtor', 'tags': ['property', 'listings', 'agents'],
            'description': 'Объекты, объявления, агенты, сделки и подбор клиентов.',
            'er_data': _mini_er(
                [
                    {'name': 'properties', 'cols': [('id', 'UUID', 'pk'), ('address', 'VARCHAR(255)')]},
                    {'name': 'agents', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                    {'name': 'listings', 'cols': [('id', 'UUID', 'pk'), ('property_id', 'UUID', 'fk', 'properties.id'), ('agent_id', 'UUID', 'fk', 'agents.id'), ('price', 'NUMERIC(14,2)')]},
                ],
                [('listings', 'properties', 'property_id', 'id'), ('listings', 'agents', 'agent_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE properties (id UUID PRIMARY KEY, address VARCHAR(255), rooms SMALLINT);\n'
                'CREATE TABLE agents (id UUID PRIMARY KEY, name VARCHAR(120), phone VARCHAR(32));\n'
                'CREATE TABLE listings (id UUID PRIMARY KEY, property_id UUID REFERENCES properties(id), agent_id UUID REFERENCES agents(id), price NUMERIC(14,2));'
            ),
            'created_at_iso': '2025-03-25T10:00:00Z',
        },
        {
            'name': 'IoT-сенсоры', 'category': 'IoT', 'fork_count': 187,
            'author': 'iot_lab', 'tags': ['iot', 'timeseries', 'devices'],
            'description': 'Устройства, замеры, оповещения и локации с time-series.',
            'er_data': _mini_er(
                [
                    {'name': 'devices', 'cols': [('id', 'UUID', 'pk'), ('serial', 'VARCHAR(64)')]},
                    {'name': 'readings', 'cols': [('id', 'BIGINT', 'pk'), ('device_id', 'UUID', 'fk', 'devices.id'), ('value', 'DOUBLE PRECISION'), ('measured_at', 'TIMESTAMPTZ')]},
                ],
                [('readings', 'devices', 'device_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE devices (id UUID PRIMARY KEY, serial VARCHAR(64) UNIQUE, location VARCHAR(120));\n'
                'CREATE TABLE readings (id BIGSERIAL PRIMARY KEY, device_id UUID REFERENCES devices(id), value DOUBLE PRECISION, measured_at TIMESTAMPTZ);\n'
                'CREATE INDEX idx_readings_measured ON readings(measured_at);'
            ),
            'created_at_iso': '2025-04-04T10:00:00Z',
        },
        {
            'name': 'Музыкальный стриминг', 'category': 'Other', 'fork_count': 165,
            'author': 'audio.dev', 'tags': ['music', 'playlists', 'artists'],
            'description': 'Артисты, альбомы, треки, плейлисты и события лайков.',
            'er_data': _mini_er(
                [
                    {'name': 'artists', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                    {'name': 'tracks', 'cols': [('id', 'UUID', 'pk'), ('artist_id', 'UUID', 'fk', 'artists.id'), ('title', 'VARCHAR(255)')]},
                    {'name': 'playlists', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                ],
                [('tracks', 'artists', 'artist_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE artists (id UUID PRIMARY KEY, name VARCHAR(120));\n'
                'CREATE TABLE tracks (id UUID PRIMARY KEY, artist_id UUID REFERENCES artists(id), title VARCHAR(255), duration_sec INTEGER);\n'
                'CREATE TABLE playlists (id UUID PRIMARY KEY, name VARCHAR(120));'
            ),
            'created_at_iso': '2025-04-14T10:00:00Z',
        },
        {
            'name': 'Трекер задач', 'category': 'SaaS', 'fork_count': 142,
            'author': 'pm.tool', 'tags': ['tasks', 'projects', 'kanban'],
            'description': 'Проекты, задачи, исполнители, комментарии и канбан-статусы.',
            'er_data': _mini_er(
                [
                    {'name': 'projects', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(255)')]},
                    {'name': 'tasks', 'cols': [('id', 'UUID', 'pk'), ('project_id', 'UUID', 'fk', 'projects.id'), ('title', 'VARCHAR(255)'), ('status', 'VARCHAR(20)')]},
                    {'name': 'comments', 'cols': [('id', 'UUID', 'pk'), ('task_id', 'UUID', 'fk', 'tasks.id'), ('body', 'TEXT')]},
                ],
                [('tasks', 'projects', 'project_id', 'id'), ('comments', 'tasks', 'task_id', 'id')],
            ),
            'sql': (
                'CREATE TABLE projects (id UUID PRIMARY KEY, name VARCHAR(255));\n'
                'CREATE TABLE tasks (id UUID PRIMARY KEY, project_id UUID REFERENCES projects(id), title VARCHAR(255), status VARCHAR(20));\n'
                'CREATE TABLE comments (id UUID PRIMARY KEY, task_id UUID REFERENCES tasks(id), body TEXT);'
            ),
            'created_at_iso': '2025-04-22T10:00:00Z',
        },
    ]


# ─────────────────────────────────────────────────────────
# 5. 5 demo-схем для Маши (зеркало MOCK_SAVED_SCHEMAS)
# ─────────────────────────────────────────────────────────

DEMO_SCHEMAS = [
    {
        'name': 'Биллинг SaaS · подписки',
        'description': 'Workspaces, пользователи, подписки, инвойсы и позиции.',
        'tags': ['billing', 'subscriptions'],
        'is_published': True, 'fork_count': 47,
        'er_data': BILLING_SAAS_ER, 'sql': BILLING_SAAS_SQL,
        'sql_dialect': 'PostgreSQL',
    },
    {
        'name': 'Интернет-магазин с корзиной',
        'description': 'Пользователи, товары, корзина, заказы, оплаты и адреса доставки.',
        'tags': ['shop', 'cart', 'orders'],
        'is_published': False, 'fork_count': 0,
        'er_data': _mini_er(
            [
                {'name': 'users', 'cols': [('id', 'UUID', 'pk'), ('email', 'VARCHAR(255)')]},
                {'name': 'products', 'cols': [('id', 'UUID', 'pk'), ('sku', 'VARCHAR(64)'), ('price', 'NUMERIC(10,2)')]},
                {'name': 'orders', 'cols': [('id', 'UUID', 'pk'), ('user_id', 'UUID', 'fk', 'users.id'), ('total', 'NUMERIC(10,2)')]},
            ],
            [('orders', 'users', 'user_id', 'id')],
        ),
        'sql': '-- shop placeholder\nCREATE TABLE users (id UUID PRIMARY KEY);\n',
        'sql_dialect': 'PostgreSQL',
    },
    {
        'name': 'Блог с тегами',
        'description': 'Авторы, посты, теги и many-to-many связь через post_tags.',
        'tags': ['blog', 'content'],
        'is_published': False, 'fork_count': 0,
        'er_data': _mini_er(
            [
                {'name': 'users', 'cols': [('id', 'INT', 'pk'), ('email', 'VARCHAR(255)')]},
                {'name': 'posts', 'cols': [('id', 'INT', 'pk'), ('author_id', 'INT', 'fk', 'users.id'), ('title', 'VARCHAR(255)')]},
            ],
            [('posts', 'users', 'author_id', 'id')],
        ),
        'sql': '-- blog placeholder\n',
        'sql_dialect': 'MySQL',
    },
    {
        'name': 'Курсы и студенты',
        'description': 'Студенты, курсы, преподаватели, зачисления, уроки и прогресс.',
        'tags': ['education', 'courses'],
        'is_published': True, 'fork_count': 12,
        'er_data': _mini_er(
            [
                {'name': 'students', 'cols': [('id', 'UUID', 'pk'), ('name', 'VARCHAR(120)')]},
                {'name': 'courses', 'cols': [('id', 'UUID', 'pk'), ('title', 'VARCHAR(255)')]},
            ],
            [],
        ),
        'sql': '-- courses placeholder\n',
        'sql_dialect': 'PostgreSQL',
    },
    {
        'name': 'CRM лиды',
        'description': 'Компании, контакты, лиды, сделки, стадии воронки и активности.',
        'tags': ['crm', 'sales'],
        'is_published': False, 'fork_count': 0,
        'er_data': _mini_er(
            [
                {'name': 'users', 'cols': [('id', 'INTEGER', 'pk'), ('name', 'TEXT')]},
                {'name': 'companies', 'cols': [('id', 'INTEGER', 'pk'), ('name', 'TEXT')]},
                {'name': 'leads', 'cols': [('id', 'INTEGER', 'pk'), ('owner_id', 'INTEGER', 'fk', 'users.id')]},
            ],
            [('leads', 'users', 'owner_id', 'id')],
        ),
        'sql': '-- CRM placeholder\n',
        'sql_dialect': 'SQLite',
    },
]


# ─────────────────────────────────────────────────────────
# 6. 3 эталонных заметки (MOCK_NOTES)
# ─────────────────────────────────────────────────────────

DEMO_NOTES = [
    {
        'type': 'idea', 'table_name': 'subscriptions',
        'body': 'Добавить trial_ends_at для бесплатного периода. Возможно, отдельный enum-статус trialing.',
    },
    {
        'type': 'warning', 'table_name': 'workspaces',
        'body': 'Проверить уникальность name в рамках одного владельца. Сейчас уникальность глобальная — это создаст конфликт при импорте.',
    },
    {
        'type': 'todo', 'table_name': '',
        'body': 'Перед публикацией шаблона: добавить индекс на invoices.issued_at и описание в маркдауне.',
    },
]


# ─────────────────────────────────────────────────────────
# Команда
# ─────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = 'Seed демо-данных, выровненных с моками фронтенда.'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Удалить старые данные перед сидом')

    @transaction.atomic
    def handle(self, *args, **opts):
        from faker import Faker
        fake = Faker('ru_RU')
        Faker.seed(42)
        random.seed(42)

        if opts['reset']:
            self.stdout.write('Reset data...')
            TableNote.objects.all().delete()
            Message.objects.all().delete()
            Chat.objects.all().delete()
            SchemaTemplate.objects.all().delete()
            SavedSchema.objects.all().delete()
            Tag.objects.all().delete()
            User.objects.exclude(is_superuser=True).delete()

        free_grp, _ = Group.objects.get_or_create(name='free_user')
        pro_grp, _ = Group.objects.get_or_create(name='pro_user')

        # 1) demo пользователи
        demo = User.objects.create_user(
            username='m_korovina',
            email='m.korovina@uni.ru',
            password='demo1234',
            is_email_verified=True,
        )
        demo.first_name = 'Маша'
        demo.last_name = 'Коровина'
        demo.save(update_fields=['first_name', 'last_name'])
        demo.groups.add(free_grp)
        UserProfile.objects.get_or_create(user=demo)

        pro = User.objects.create_user(
            username='pro_user',
            email='pro@uni.ru',
            password='demo1234',
            is_email_verified=True,
        )
        pro.groups.add(pro_grp)
        UserProfile.objects.get_or_create(user=pro)

        self.stdout.write('  demo + pro юзеры созданы')

        # 2) 16 авторов шаблонов
        authors_by_handle = {}
        for handle, plan in AUTHORS_DATA:
            user = User.objects.create_user(
                username=handle.replace('.', '_'),
                email=f'{handle}@community.local',
                password='demo1234',
                is_email_verified=True,
            )
            user.groups.add(pro_grp if plan == 'pro' else free_grp)
            UserProfile.objects.get_or_create(user=user)
            authors_by_handle[handle] = user

        # 3) +5 рандомных юзеров (Faker)
        random_users = []
        for i in range(5):
            uname = f'{fake.user_name()}_{random.randint(100, 999)}'
            user = User.objects.create_user(
                username=uname,
                email=f'rand{i}_{uuid.uuid4().hex[:6]}@uni.ru',
                password='demo1234',
                is_email_verified=random.random() > 0.3,
            )
            user.groups.add(free_grp)
            UserProfile.objects.get_or_create(user=user)
            random_users.append(user)

        all_users = [demo, pro, *authors_by_handle.values(), *random_users]
        self.stdout.write(f'  пользователей всего: {len(all_users)}')

        # 4) 53 системных тега
        tags_by_name = {}
        for i, name in enumerate(TAG_NAMES):
            tag = Tag.objects.create(
                user=None,
                name=name,
                color=TAG_COLORS[i % len(TAG_COLORS)],
            )
            tags_by_name[name] = tag
        self.stdout.write(f'  системных тегов: {len(tags_by_name)}')

        # 5) 16 публичных шаблонов
        templates = []
        for tdata in _build_templates():
            template = SchemaTemplate.objects.create(
                author=authors_by_handle[tdata['author']],
                name=tdata['name'],
                description=tdata['description'],
                category=tdata['category'],
                er_data=tdata['er_data'],
                sql=tdata['sql'],
                sql_dialect='PostgreSQL',
                fork_count=tdata['fork_count'],
            )
            for tname in tdata['tags']:
                if tname in tags_by_name:
                    template.tags.add(tags_by_name[tname])
            templates.append(template)
        self.stdout.write(f'  публичных шаблонов: {len(templates)}')

        # 6) 5 demo-схем для Маши
        billing_schema = None
        for sdata in DEMO_SCHEMAS:
            schema = SavedSchema.objects.create(
                user=demo,
                name=sdata['name'],
                description=sdata['description'],
                er_data=sdata['er_data'],
                sql=sdata['sql'],
                sql_dialect=sdata['sql_dialect'],
                is_published=sdata['is_published'],
                fork_count=sdata['fork_count'],
            )
            for tname in sdata['tags']:
                # Если тег есть в системных — используем; иначе создаём личный
                if tname in tags_by_name:
                    schema.tags.add(tags_by_name[tname])
                else:
                    personal, _ = Tag.objects.get_or_create(
                        user=demo, name=tname,
                        defaults={'color': '#8b5cf6'},
                    )
                    schema.tags.add(personal)
            if sdata['name'].startswith('Биллинг SaaS'):
                billing_schema = schema

        self.stdout.write(f'  demo-схем: {SavedSchema.objects.filter(user=demo).count()}')

        # 7) ~30 рандомных схем у других юзеров (форки шаблонов)
        random_schema_count = 0
        for user in [*authors_by_handle.values(), *random_users]:
            for _ in range(random.randint(1, 3)):
                template = random.choice(templates)
                schema = SavedSchema.objects.create(
                    user=user,
                    name=f'{template.name} · {fake.word()}',
                    description=template.description,
                    er_data=template.er_data,
                    sql=template.sql,
                    sql_dialect=template.sql_dialect,
                    is_published=False,
                    fork_count=0,
                )
                schema.tags.set(template.tags.filter(user__isnull=True))
                random_schema_count += 1
        self.stdout.write(f'  рандомных схем: {random_schema_count}')

        # 8) 5 чатов для Маши с 2-3 сообщениями
        chat_titles = [
            'Биллинг SaaS подписок', 'Интернет-магазин', 'Блог-платформа',
            'CRM воронка', 'Складская система',
        ]
        for title in chat_titles:
            chat = Chat.objects.create(user=demo, title=title)
            Message.objects.create(
                chat=chat, role='user',
                content=f'Спроектируй БД для: {title}',
            )
            assistant_kwargs = {'chat': chat, 'role': 'assistant',
                                'content': 'Вот предлагаемая структура...'}
            if title == 'Биллинг SaaS подписок':
                assistant_kwargs['er_data'] = BILLING_SAAS_ER
                assistant_kwargs['sql'] = BILLING_SAAS_SQL
            Message.objects.create(**assistant_kwargs)
        self.stdout.write(f'  чатов: {Chat.objects.count()}')

        # 9) 3 эталонных + 50 рандомных заметок
        if billing_schema:
            for note_data in DEMO_NOTES:
                TableNote.objects.create(
                    schema=billing_schema,
                    author=demo,
                    type=note_data['type'],
                    table_name=note_data['table_name'],
                    body=note_data['body'],
                )

        # 50 рандомных — половина к схемам, половина к шаблонам
        all_schemas = list(SavedSchema.objects.all())
        types = ['info', 'warning', 'idea', 'todo']
        for _ in range(25):
            schema = random.choice(all_schemas)
            TableNote.objects.create(
                schema=schema,
                author=schema.user,
                type=random.choice(types),
                table_name=fake.word() if random.random() > 0.3 else '',
                body=fake.sentence(nb_words=12),
            )
        for _ in range(25):
            template = random.choice(templates)
            TableNote.objects.create(
                template=template,
                author=template.author,
                type=random.choice(types),
                table_name=fake.word() if random.random() > 0.3 else '',
                body=fake.sentence(nb_words=12),
            )
        self.stdout.write(f'  заметок: {TableNote.objects.count()}')

        # Итог
        self.stdout.write(self.style.SUCCESS(
            f'\nDone:\n'
            f'  Users     = {User.objects.count()}\n'
            f'  Tags      = {Tag.objects.count()}\n'
            f'  Templates = {SchemaTemplate.objects.count()}\n'
            f'  Schemas   = {SavedSchema.objects.count()}\n'
            f'  Notes     = {TableNote.objects.count()}\n'
            f'  Chats     = {Chat.objects.count()}\n'
            f'  Messages  = {Message.objects.count()}'
        ))
