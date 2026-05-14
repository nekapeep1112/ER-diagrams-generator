import type { Column, EREdge, ERData, ERNode, SchemaTemplate, User } from '@/types';
import { tagsByNames } from './tags';

const AUTHORS: Record<string, User> = {
  'alex.dev':  { id: 1001, email: 'alex.dev@community.local',  username: 'alex.dev',  plan: 'pro' },
  'maria.r':   { id: 1002, email: 'maria.r@community.local',   username: 'maria.r',   plan: 'pro' },
  'dev_anon':  { id: 1003, email: 'dev_anon@community.local',  username: 'dev_anon',  plan: 'free' },
  'tweet.dev': { id: 1004, email: 'tweet.dev@community.local', username: 'tweet.dev', plan: 'pro' },
  'anna.k':    { id: 1005, email: 'anna.k@community.local',    username: 'anna.k',    plan: 'free' },
  'chef_db':   { id: 1006, email: 'chef_db@community.local',   username: 'chef_db',   plan: 'pro' },
  'med_pro':   { id: 1007, email: 'med_pro@community.local',   username: 'med_pro',   plan: 'pro' },
  'data.eng':  { id: 1008, email: 'data.eng@community.local',  username: 'data.eng',  plan: 'pro' },
  'gopher':    { id: 1009, email: 'gopher@community.local',    username: 'gopher',    plan: 'free' },
  'warehouse': { id: 1010, email: 'warehouse@community.local', username: 'warehouse', plan: 'pro' },
  'book.dev':  { id: 1011, email: 'book.dev@community.local',  username: 'book.dev',  plan: 'pro' },
  'sales.pro': { id: 1012, email: 'sales.pro@community.local', username: 'sales.pro', plan: 'pro' },
  'realtor':   { id: 1013, email: 'realtor@community.local',   username: 'realtor',   plan: 'pro' },
  'iot_lab':   { id: 1014, email: 'iot_lab@community.local',   username: 'iot_lab',   plan: 'pro' },
  'audio.dev': { id: 1015, email: 'audio.dev@community.local', username: 'audio.dev', plan: 'pro' },
  'pm.tool':   { id: 1016, email: 'pm.tool@community.local',   username: 'pm.tool',   plan: 'pro' },
};

function col(
  name: string,
  type: string,
  opts: Partial<Pick<Column, 'isPrimary' | 'isForeign' | 'references'>> = {},
): Column {
  return {
    name,
    type,
    isPrimary: opts.isPrimary ?? false,
    isForeign: opts.isForeign ?? false,
    references: opts.references ?? null,
  };
}

function node(id: string, x: number, y: number, columns: Column[]): ERNode {
  return { id, type: 'tableNode', position: { x, y }, data: { tableName: id, columns } };
}

function edge(
  id: string,
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string,
  label: string,
): EREdge {
  return { id, source, target, sourceHandle, targetHandle, type: 'smoothstep', animated: true, label };
}

// ─────────────────────────────────────────────────────────
// Canonical Биллинг SaaS schema — used by templates.ts[#2],
// schemas.ts[0], chats.ts[chat-1].finalMessage
// ─────────────────────────────────────────────────────────

export const BILLING_SAAS_ER_DATA: ERData = {
  nodes: [
    node('workspaces', 0, 0, [
      col('id', 'UUID', { isPrimary: true }),
      col('name', 'VARCHAR(120)'),
      col('plan', 'VARCHAR(20)'),
      col('created_at', 'TIMESTAMPTZ'),
    ]),
    node('users', 400, 0, [
      col('id', 'UUID', { isPrimary: true }),
      col('workspace_id', 'UUID', { isForeign: true, references: 'workspaces.id' }),
      col('email', 'VARCHAR(255)'),
      col('role', 'VARCHAR(20)'),
    ]),
    node('subscriptions', 0, 200, [
      col('id', 'UUID', { isPrimary: true }),
      col('workspace_id', 'UUID', { isForeign: true, references: 'workspaces.id' }),
      col('status', 'VARCHAR(20)'),
      col('renews_at', 'TIMESTAMPTZ'),
      col('trial_ends_at', 'TIMESTAMPTZ'),
    ]),
    node('invoices', 400, 200, [
      col('id', 'UUID', { isPrimary: true }),
      col('sub_id', 'UUID', { isForeign: true, references: 'subscriptions.id' }),
      col('total', 'NUMERIC(10,2)'),
      col('status', 'VARCHAR(20)'),
      col('issued_at', 'TIMESTAMPTZ'),
    ]),
    node('line_items', 200, 400, [
      col('id', 'UUID', { isPrimary: true }),
      col('invoice_id', 'UUID', { isForeign: true, references: 'invoices.id' }),
      col('amount', 'NUMERIC(10,2)'),
      col('qty', 'INTEGER'),
    ]),
  ],
  edges: [
    edge('e-ws-users', 'users', 'workspaces', 'workspace_id', 'id', '1:N'),
    edge('e-ws-subs',  'subscriptions', 'workspaces', 'workspace_id', 'id', '1:N'),
    edge('e-subs-inv', 'invoices', 'subscriptions', 'sub_id', 'id', '1:N'),
    edge('e-inv-li',   'line_items', 'invoices', 'invoice_id', 'id', '1:N'),
  ],
};

export const BILLING_SAAS_SQL = `-- Сгенерировано ER Database · диалект PostgreSQL
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
`;

// ─────────────────────────────────────────────────────────
// Minimal helpers for non-canonical templates
// ─────────────────────────────────────────────────────────

function miniERA(
  defs: { name: string; cols: Array<[string, string, ('pk' | 'fk' | null)?, string?]> }[],
  edges: Array<[string, string, string, string]>,
): ERData {
  const nodes: ERNode[] = defs.map((d, i) =>
    node(
      d.name,
      (i % 2) * 400,
      Math.floor(i / 2) * 200,
      d.cols.map(([n, t, kind, ref]) =>
        col(n, t, {
          isPrimary: kind === 'pk',
          isForeign: kind === 'fk',
          references: ref ?? null,
        }),
      ),
    ),
  );
  const erEdges: EREdge[] = edges.map(([src, tgt, srcH, tgtH], i) =>
    edge(`e-${i}`, src, tgt, srcH, tgtH, '1:N'),
  );
  return { nodes, edges: erEdges };
}

// ─────────────────────────────────────────────────────────
// 16 templates (sorted by fork_count desc)
// ─────────────────────────────────────────────────────────

export const MOCK_TEMPLATES: SchemaTemplate[] = [
  {
    id: 'tmpl-shop',
    name: 'Интернет-магазин',
    description: 'Каталог, корзина, заказы и интеграция со Stripe.',
    category: 'E-commerce',
    fork_count: 1284,
    author: AUTHORS['alex.dev'],
    tags: tagsByNames(['retail', 'cart', 'payments', 'auth']),
    er_data: miniERA(
      [
        { name: 'users', cols: [['id', 'UUID', 'pk'], ['email', 'VARCHAR(255)']] },
        { name: 'products', cols: [['id', 'UUID', 'pk'], ['sku', 'VARCHAR(64)'], ['price', 'NUMERIC(10,2)']] },
        { name: 'orders', cols: [['id', 'UUID', 'pk'], ['user_id', 'UUID', 'fk', 'users.id'], ['total', 'NUMERIC(10,2)']] },
      ],
      [['orders', 'users', 'user_id', 'id']],
    ),
    sql: `CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR(255) UNIQUE);
CREATE TABLE products (id UUID PRIMARY KEY, sku VARCHAR(64) UNIQUE, price NUMERIC(10,2) NOT NULL);
CREATE TABLE orders (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), total NUMERIC(10,2) NOT NULL);`,
    created_at: '2024-09-12T10:00:00Z',
  },
  {
    id: 'tmpl-billing-saas',
    name: 'Биллинг SaaS',
    description: 'Workspaces, подписки, инвойсы и позиции с usage-tracking.',
    category: 'SaaS',
    fork_count: 947,
    author: AUTHORS['maria.r'],
    tags: tagsByNames(['billing', 'subscriptions']),
    er_data: BILLING_SAAS_ER_DATA,
    sql: BILLING_SAAS_SQL,
    created_at: '2024-10-08T10:00:00Z',
  },
  {
    id: 'tmpl-blog',
    name: 'Блог с комментариями',
    description: 'Посты, категории, теги, ветки комментариев и роли пользователей.',
    category: 'CMS',
    fork_count: 892,
    author: AUTHORS['dev_anon'],
    tags: tagsByNames(['content', 'comments', 'tags']),
    er_data: miniERA(
      [
        { name: 'users', cols: [['id', 'UUID', 'pk'], ['email', 'VARCHAR(255)']] },
        { name: 'posts', cols: [['id', 'UUID', 'pk'], ['author_id', 'UUID', 'fk', 'users.id'], ['title', 'VARCHAR(255)']] },
        { name: 'comments', cols: [['id', 'UUID', 'pk'], ['post_id', 'UUID', 'fk', 'posts.id'], ['body', 'TEXT']] },
      ],
      [['posts', 'users', 'author_id', 'id'], ['comments', 'posts', 'post_id', 'id']],
    ),
    sql: `CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR(255) UNIQUE);
CREATE TABLE posts (id UUID PRIMARY KEY, author_id UUID REFERENCES users(id), title VARCHAR(255), body TEXT);
CREATE TABLE comments (id UUID PRIMARY KEY, post_id UUID REFERENCES posts(id), body TEXT, created_at TIMESTAMPTZ);`,
    created_at: '2024-11-02T10:00:00Z',
  },
  {
    id: 'tmpl-social',
    name: 'Социальная сеть',
    description: 'Пользователи, подписки, посты, лайки, репосты и треды ответов.',
    category: 'Social',
    fork_count: 612,
    author: AUTHORS['tweet.dev'],
    tags: tagsByNames(['social', 'feed', 'follows', 'auth']),
    er_data: miniERA(
      [
        { name: 'users', cols: [['id', 'UUID', 'pk'], ['handle', 'VARCHAR(32)']] },
        { name: 'posts', cols: [['id', 'UUID', 'pk'], ['author_id', 'UUID', 'fk', 'users.id'], ['body', 'TEXT']] },
        { name: 'follows', cols: [['follower_id', 'UUID', 'fk', 'users.id'], ['followee_id', 'UUID', 'fk', 'users.id']] },
        { name: 'likes', cols: [['user_id', 'UUID', 'fk', 'users.id'], ['post_id', 'UUID', 'fk', 'posts.id']] },
      ],
      [['posts', 'users', 'author_id', 'id'], ['likes', 'posts', 'post_id', 'id']],
    ),
    sql: `CREATE TABLE users (id UUID PRIMARY KEY, handle VARCHAR(32) UNIQUE);
CREATE TABLE posts (id UUID PRIMARY KEY, author_id UUID REFERENCES users(id), body TEXT);
CREATE TABLE follows (follower_id UUID, followee_id UUID, PRIMARY KEY (follower_id, followee_id));
CREATE TABLE likes (user_id UUID, post_id UUID, PRIMARY KEY (user_id, post_id));`,
    created_at: '2024-11-20T10:00:00Z',
  },
  {
    id: 'tmpl-lms',
    name: 'Школьная LMS',
    description: 'Курсы, студенты, зачисления, задания и выставление оценок.',
    category: 'Education',
    fork_count: 521,
    author: AUTHORS['anna.k'],
    tags: tagsByNames(['education', 'courses', 'students']),
    er_data: miniERA(
      [
        { name: 'students', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)']] },
        { name: 'courses', cols: [['id', 'UUID', 'pk'], ['title', 'VARCHAR(255)']] },
        { name: 'enrollments', cols: [['student_id', 'UUID', 'fk', 'students.id'], ['course_id', 'UUID', 'fk', 'courses.id']] },
      ],
      [['enrollments', 'students', 'student_id', 'id'], ['enrollments', 'courses', 'course_id', 'id']],
    ),
    sql: `CREATE TABLE students (id UUID PRIMARY KEY, name VARCHAR(120), email VARCHAR(255));
CREATE TABLE courses (id UUID PRIMARY KEY, title VARCHAR(255), instructor VARCHAR(120));
CREATE TABLE enrollments (student_id UUID REFERENCES students(id), course_id UUID REFERENCES courses(id), grade SMALLINT);`,
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'tmpl-restaurant-pos',
    name: 'Касса ресторана',
    description: 'Столики, меню, заказы, оплаты и учёт смен персонала.',
    category: 'Finance',
    fork_count: 458,
    author: AUTHORS['chef_db'],
    tags: tagsByNames(['pos', 'orders', 'staff', 'payments']),
    er_data: miniERA(
      [
        { name: 'tables', cols: [['id', 'UUID', 'pk'], ['number', 'INTEGER']] },
        { name: 'menu_items', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)'], ['price', 'NUMERIC(10,2)']] },
        { name: 'orders', cols: [['id', 'UUID', 'pk'], ['table_id', 'UUID', 'fk', 'tables.id'], ['total', 'NUMERIC(10,2)']] },
      ],
      [['orders', 'tables', 'table_id', 'id']],
    ),
    sql: `CREATE TABLE tables (id UUID PRIMARY KEY, number INTEGER UNIQUE);
CREATE TABLE menu_items (id UUID PRIMARY KEY, name VARCHAR(120), price NUMERIC(10,2));
CREATE TABLE orders (id UUID PRIMARY KEY, table_id UUID REFERENCES tables(id), total NUMERIC(10,2));`,
    created_at: '2024-12-14T10:00:00Z',
  },
  {
    id: 'tmpl-hospital',
    name: 'Управление клиникой',
    description: 'Пациенты, врачи, приёмы, рецепты и биллинг.',
    category: 'Healthcare',
    fork_count: 387,
    author: AUTHORS['med_pro'],
    tags: tagsByNames(['healthcare', 'patients', 'appointments']),
    er_data: miniERA(
      [
        { name: 'patients', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)'], ['dob', 'DATE']] },
        { name: 'doctors', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)']] },
        { name: 'appointments', cols: [['id', 'UUID', 'pk'], ['patient_id', 'UUID', 'fk', 'patients.id'], ['doctor_id', 'UUID', 'fk', 'doctors.id']] },
      ],
      [['appointments', 'patients', 'patient_id', 'id'], ['appointments', 'doctors', 'doctor_id', 'id']],
    ),
    sql: `CREATE TABLE patients (id UUID PRIMARY KEY, name VARCHAR(120), dob DATE);
CREATE TABLE doctors (id UUID PRIMARY KEY, name VARCHAR(120), speciality VARCHAR(120));
CREATE TABLE appointments (id UUID PRIMARY KEY, patient_id UUID REFERENCES patients(id), doctor_id UUID REFERENCES doctors(id), scheduled_at TIMESTAMPTZ);`,
    created_at: '2025-01-08T10:00:00Z',
  },
  {
    id: 'tmpl-analytics',
    name: 'Дашборд аналитики',
    description: 'Схема событий с time-series партиционированием.',
    category: 'Analytics',
    fork_count: 342,
    author: AUTHORS['data.eng'],
    tags: tagsByNames(['events', 'metrics', 'users']),
    er_data: miniERA(
      [
        { name: 'users', cols: [['id', 'UUID', 'pk'], ['anon_id', 'VARCHAR(64)']] },
        { name: 'events', cols: [['id', 'BIGINT', 'pk'], ['user_id', 'UUID', 'fk', 'users.id'], ['name', 'VARCHAR(64)'], ['occurred_at', 'TIMESTAMPTZ']] },
      ],
      [['events', 'users', 'user_id', 'id']],
    ),
    sql: `CREATE TABLE users (id UUID PRIMARY KEY, anon_id VARCHAR(64) UNIQUE);
CREATE TABLE events (id BIGSERIAL PRIMARY KEY, user_id UUID REFERENCES users(id), name VARCHAR(64), occurred_at TIMESTAMPTZ NOT NULL, payload JSONB);
CREATE INDEX idx_events_occurred ON events(occurred_at);`,
    created_at: '2025-01-22T10:00:00Z',
  },
  {
    id: 'tmpl-forum',
    name: 'Форум',
    description: 'Разделы, ветки, посты, голосования и модераторские действия.',
    category: 'Social',
    fork_count: 298,
    author: AUTHORS['gopher'],
    tags: tagsByNames(['forum', 'threads', 'karma']),
    er_data: miniERA(
      [
        { name: 'boards', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)']] },
        { name: 'threads', cols: [['id', 'UUID', 'pk'], ['board_id', 'UUID', 'fk', 'boards.id'], ['title', 'VARCHAR(255)']] },
        { name: 'posts', cols: [['id', 'UUID', 'pk'], ['thread_id', 'UUID', 'fk', 'threads.id'], ['body', 'TEXT']] },
      ],
      [['threads', 'boards', 'board_id', 'id'], ['posts', 'threads', 'thread_id', 'id']],
    ),
    sql: `CREATE TABLE boards (id UUID PRIMARY KEY, name VARCHAR(120) UNIQUE);
CREATE TABLE threads (id UUID PRIMARY KEY, board_id UUID REFERENCES boards(id), title VARCHAR(255));
CREATE TABLE posts (id UUID PRIMARY KEY, thread_id UUID REFERENCES threads(id), body TEXT, created_at TIMESTAMPTZ);`,
    created_at: '2025-02-05T10:00:00Z',
  },
  {
    id: 'tmpl-inventory',
    name: 'Складской учёт',
    description: 'Товары, склады, остатки и заказы поставщикам.',
    category: 'E-commerce',
    fork_count: 276,
    author: AUTHORS['warehouse'],
    tags: tagsByNames(['inventory', 'stock', 'suppliers']),
    er_data: miniERA(
      [
        { name: 'products', cols: [['id', 'UUID', 'pk'], ['sku', 'VARCHAR(64)']] },
        { name: 'warehouses', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)']] },
        { name: 'stock', cols: [['product_id', 'UUID', 'fk', 'products.id'], ['warehouse_id', 'UUID', 'fk', 'warehouses.id'], ['qty', 'INTEGER']] },
      ],
      [['stock', 'products', 'product_id', 'id'], ['stock', 'warehouses', 'warehouse_id', 'id']],
    ),
    sql: `CREATE TABLE products (id UUID PRIMARY KEY, sku VARCHAR(64) UNIQUE);
CREATE TABLE warehouses (id UUID PRIMARY KEY, name VARCHAR(120));
CREATE TABLE stock (product_id UUID REFERENCES products(id), warehouse_id UUID REFERENCES warehouses(id), qty INTEGER NOT NULL, PRIMARY KEY (product_id, warehouse_id));`,
    created_at: '2025-02-19T10:00:00Z',
  },
  {
    id: 'tmpl-booking',
    name: 'Бронирование',
    description: 'Ресурсы, тайм-слоты, бронирования и регулярная доступность.',
    category: 'SaaS',
    fork_count: 254,
    author: AUTHORS['book.dev'],
    tags: tagsByNames(['booking', 'calendar', 'resources']),
    er_data: miniERA(
      [
        { name: 'resources', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)']] },
        { name: 'slots', cols: [['id', 'UUID', 'pk'], ['resource_id', 'UUID', 'fk', 'resources.id'], ['starts_at', 'TIMESTAMPTZ']] },
        { name: 'bookings', cols: [['id', 'UUID', 'pk'], ['slot_id', 'UUID', 'fk', 'slots.id'], ['user_email', 'VARCHAR(255)']] },
      ],
      [['slots', 'resources', 'resource_id', 'id'], ['bookings', 'slots', 'slot_id', 'id']],
    ),
    sql: `CREATE TABLE resources (id UUID PRIMARY KEY, name VARCHAR(120));
CREATE TABLE slots (id UUID PRIMARY KEY, resource_id UUID REFERENCES resources(id), starts_at TIMESTAMPTZ, duration_min INTEGER);
CREATE TABLE bookings (id UUID PRIMARY KEY, slot_id UUID REFERENCES slots(id), user_email VARCHAR(255));`,
    created_at: '2025-03-03T10:00:00Z',
  },
  {
    id: 'tmpl-crm',
    name: 'CRM с воронкой',
    description: 'Компании, контакты, лиды, сделки и стадии воронки.',
    category: 'SaaS',
    fork_count: 231,
    author: AUTHORS['sales.pro'],
    tags: tagsByNames(['crm', 'leads', 'deals']),
    er_data: miniERA(
      [
        { name: 'companies', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(255)']] },
        { name: 'contacts', cols: [['id', 'UUID', 'pk'], ['company_id', 'UUID', 'fk', 'companies.id'], ['email', 'VARCHAR(255)']] },
        { name: 'deals', cols: [['id', 'UUID', 'pk'], ['contact_id', 'UUID', 'fk', 'contacts.id'], ['amount', 'NUMERIC(12,2)']] },
      ],
      [['contacts', 'companies', 'company_id', 'id'], ['deals', 'contacts', 'contact_id', 'id']],
    ),
    sql: `CREATE TABLE companies (id UUID PRIMARY KEY, name VARCHAR(255));
CREATE TABLE contacts (id UUID PRIMARY KEY, company_id UUID REFERENCES companies(id), email VARCHAR(255));
CREATE TABLE deals (id UUID PRIMARY KEY, contact_id UUID REFERENCES contacts(id), amount NUMERIC(12,2), stage VARCHAR(40));`,
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'tmpl-real-estate',
    name: 'Недвижимость',
    description: 'Объекты, объявления, агенты, сделки и подбор клиентов.',
    category: 'Finance',
    fork_count: 198,
    author: AUTHORS['realtor'],
    tags: tagsByNames(['property', 'listings', 'agents']),
    er_data: miniERA(
      [
        { name: 'properties', cols: [['id', 'UUID', 'pk'], ['address', 'VARCHAR(255)']] },
        { name: 'agents', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)']] },
        { name: 'listings', cols: [['id', 'UUID', 'pk'], ['property_id', 'UUID', 'fk', 'properties.id'], ['agent_id', 'UUID', 'fk', 'agents.id'], ['price', 'NUMERIC(14,2)']] },
      ],
      [['listings', 'properties', 'property_id', 'id'], ['listings', 'agents', 'agent_id', 'id']],
    ),
    sql: `CREATE TABLE properties (id UUID PRIMARY KEY, address VARCHAR(255), rooms SMALLINT);
CREATE TABLE agents (id UUID PRIMARY KEY, name VARCHAR(120), phone VARCHAR(32));
CREATE TABLE listings (id UUID PRIMARY KEY, property_id UUID REFERENCES properties(id), agent_id UUID REFERENCES agents(id), price NUMERIC(14,2));`,
    created_at: '2025-03-25T10:00:00Z',
  },
  {
    id: 'tmpl-iot',
    name: 'IoT-сенсоры',
    description: 'Устройства, замеры, оповещения и локации с time-series.',
    category: 'IoT',
    fork_count: 187,
    author: AUTHORS['iot_lab'],
    tags: tagsByNames(['iot', 'timeseries', 'devices']),
    er_data: miniERA(
      [
        { name: 'devices', cols: [['id', 'UUID', 'pk'], ['serial', 'VARCHAR(64)']] },
        { name: 'readings', cols: [['id', 'BIGINT', 'pk'], ['device_id', 'UUID', 'fk', 'devices.id'], ['value', 'DOUBLE PRECISION'], ['measured_at', 'TIMESTAMPTZ']] },
      ],
      [['readings', 'devices', 'device_id', 'id']],
    ),
    sql: `CREATE TABLE devices (id UUID PRIMARY KEY, serial VARCHAR(64) UNIQUE, location VARCHAR(120));
CREATE TABLE readings (id BIGSERIAL PRIMARY KEY, device_id UUID REFERENCES devices(id), value DOUBLE PRECISION, measured_at TIMESTAMPTZ);
CREATE INDEX idx_readings_measured ON readings(measured_at);`,
    created_at: '2025-04-04T10:00:00Z',
  },
  {
    id: 'tmpl-music',
    name: 'Музыкальный стриминг',
    description: 'Артисты, альбомы, треки, плейлисты и события лайков.',
    category: 'Other',
    fork_count: 165,
    author: AUTHORS['audio.dev'],
    tags: tagsByNames(['music', 'playlists', 'artists']),
    er_data: miniERA(
      [
        { name: 'artists', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)']] },
        { name: 'tracks', cols: [['id', 'UUID', 'pk'], ['artist_id', 'UUID', 'fk', 'artists.id'], ['title', 'VARCHAR(255)']] },
        { name: 'playlists', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(120)']] },
      ],
      [['tracks', 'artists', 'artist_id', 'id']],
    ),
    sql: `CREATE TABLE artists (id UUID PRIMARY KEY, name VARCHAR(120));
CREATE TABLE tracks (id UUID PRIMARY KEY, artist_id UUID REFERENCES artists(id), title VARCHAR(255), duration_sec INTEGER);
CREATE TABLE playlists (id UUID PRIMARY KEY, name VARCHAR(120));`,
    created_at: '2025-04-14T10:00:00Z',
  },
  {
    id: 'tmpl-tasks',
    name: 'Трекер задач',
    description: 'Проекты, задачи, исполнители, комментарии и канбан-статусы.',
    category: 'SaaS',
    fork_count: 142,
    author: AUTHORS['pm.tool'],
    tags: tagsByNames(['tasks', 'projects', 'kanban']),
    er_data: miniERA(
      [
        { name: 'projects', cols: [['id', 'UUID', 'pk'], ['name', 'VARCHAR(255)']] },
        { name: 'tasks', cols: [['id', 'UUID', 'pk'], ['project_id', 'UUID', 'fk', 'projects.id'], ['title', 'VARCHAR(255)'], ['status', 'VARCHAR(20)']] },
        { name: 'comments', cols: [['id', 'UUID', 'pk'], ['task_id', 'UUID', 'fk', 'tasks.id'], ['body', 'TEXT']] },
      ],
      [['tasks', 'projects', 'project_id', 'id'], ['comments', 'tasks', 'task_id', 'id']],
    ),
    sql: `CREATE TABLE projects (id UUID PRIMARY KEY, name VARCHAR(255));
CREATE TABLE tasks (id UUID PRIMARY KEY, project_id UUID REFERENCES projects(id), title VARCHAR(255), status VARCHAR(20));
CREATE TABLE comments (id UUID PRIMARY KEY, task_id UUID REFERENCES tasks(id), body TEXT);`,
    created_at: '2025-04-22T10:00:00Z',
  },
];
