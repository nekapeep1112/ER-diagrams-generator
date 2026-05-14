import type { Column, EREdge, ERData, ERNode, SavedSchema } from '@/types';
import { tagsByNames } from './tags';
import { BILLING_SAAS_ER_DATA, BILLING_SAAS_SQL } from './templates';

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
// Schema 1: Интернет-магазин с корзиной (7 таблиц / 8 связей)
// ─────────────────────────────────────────────────────────

const SHOP_ER: ERData = {
  nodes: [
    node('users', 0, 0, [
      col('id', 'UUID', { isPrimary: true }),
      col('email', 'VARCHAR(255)'),
      col('name', 'VARCHAR(120)'),
    ]),
    node('addresses', 400, 0, [
      col('id', 'UUID', { isPrimary: true }),
      col('user_id', 'UUID', { isForeign: true, references: 'users.id' }),
      col('street', 'VARCHAR(255)'),
      col('city', 'VARCHAR(120)'),
    ]),
    node('products', 800, 0, [
      col('id', 'UUID', { isPrimary: true }),
      col('sku', 'VARCHAR(64)'),
      col('price', 'NUMERIC(10,2)'),
    ]),
    node('cart_items', 0, 200, [
      col('id', 'UUID', { isPrimary: true }),
      col('user_id', 'UUID', { isForeign: true, references: 'users.id' }),
      col('product_id', 'UUID', { isForeign: true, references: 'products.id' }),
      col('qty', 'INTEGER'),
    ]),
    node('orders', 400, 200, [
      col('id', 'UUID', { isPrimary: true }),
      col('user_id', 'UUID', { isForeign: true, references: 'users.id' }),
      col('address_id', 'UUID', { isForeign: true, references: 'addresses.id' }),
      col('total', 'NUMERIC(10,2)'),
      col('status', 'VARCHAR(20)'),
    ]),
    node('order_items', 800, 200, [
      col('id', 'UUID', { isPrimary: true }),
      col('order_id', 'UUID', { isForeign: true, references: 'orders.id' }),
      col('product_id', 'UUID', { isForeign: true, references: 'products.id' }),
      col('qty', 'INTEGER'),
      col('unit_price', 'NUMERIC(10,2)'),
    ]),
    node('payments', 400, 400, [
      col('id', 'UUID', { isPrimary: true }),
      col('order_id', 'UUID', { isForeign: true, references: 'orders.id' }),
      col('amount', 'NUMERIC(10,2)'),
      col('status', 'VARCHAR(20)'),
    ]),
  ],
  edges: [
    edge('e1', 'addresses', 'users', 'user_id', 'id', '1:N'),
    edge('e2', 'cart_items', 'users', 'user_id', 'id', '1:N'),
    edge('e3', 'cart_items', 'products', 'product_id', 'id', '1:N'),
    edge('e4', 'orders', 'users', 'user_id', 'id', '1:N'),
    edge('e5', 'orders', 'addresses', 'address_id', 'id', '1:N'),
    edge('e6', 'order_items', 'orders', 'order_id', 'id', '1:N'),
    edge('e7', 'order_items', 'products', 'product_id', 'id', '1:N'),
    edge('e8', 'payments', 'orders', 'order_id', 'id', '1:N'),
  ],
};

const SHOP_SQL = `-- Сгенерировано ER Database · диалект PostgreSQL
-- 7 таблиц · 8 связей

CREATE TABLE users (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name  VARCHAR(120)
);

CREATE TABLE addresses (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  street  VARCHAR(255) NOT NULL,
  city    VARCHAR(120) NOT NULL
);

CREATE TABLE products (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku   VARCHAR(64) NOT NULL UNIQUE,
  price NUMERIC(10,2) NOT NULL
);

CREATE TABLE cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  qty        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  address_id UUID REFERENCES addresses(id),
  total      NUMERIC(10,2) NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending'
);

CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  qty        INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE payments (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  amount   NUMERIC(10,2) NOT NULL,
  status   VARCHAR(20) NOT NULL DEFAULT 'pending'
);
`;

// ─────────────────────────────────────────────────────────
// Schema 2: Блог с тегами (4 таблицы / 3 связи), MySQL
// ─────────────────────────────────────────────────────────

const BLOG_ER: ERData = {
  nodes: [
    node('users', 0, 0, [
      col('id', 'INT', { isPrimary: true }),
      col('email', 'VARCHAR(255)'),
    ]),
    node('posts', 400, 0, [
      col('id', 'INT', { isPrimary: true }),
      col('author_id', 'INT', { isForeign: true, references: 'users.id' }),
      col('title', 'VARCHAR(255)'),
      col('body', 'TEXT'),
    ]),
    node('tags', 0, 200, [
      col('id', 'INT', { isPrimary: true }),
      col('name', 'VARCHAR(64)'),
    ]),
    node('post_tags', 400, 200, [
      col('post_id', 'INT', { isForeign: true, references: 'posts.id' }),
      col('tag_id', 'INT', { isForeign: true, references: 'tags.id' }),
    ]),
  ],
  edges: [
    edge('e1', 'posts', 'users', 'author_id', 'id', '1:N'),
    edge('e2', 'post_tags', 'posts', 'post_id', 'id', '1:N'),
    edge('e3', 'post_tags', 'tags', 'tag_id', 'id', '1:N'),
  ],
};

const BLOG_SQL = `-- Сгенерировано ER Database · диалект MySQL
-- 4 таблицы · 3 связи

CREATE TABLE users (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  email  VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE posts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  author_id  INT NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tags (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id  INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

// ─────────────────────────────────────────────────────────
// Schema 3: Курсы и студенты (6 таблиц / 5 связей)
// ─────────────────────────────────────────────────────────

const COURSES_ER: ERData = {
  nodes: [
    node('students', 0, 0, [
      col('id', 'UUID', { isPrimary: true }),
      col('name', 'VARCHAR(120)'),
      col('email', 'VARCHAR(255)'),
    ]),
    node('instructors', 400, 0, [
      col('id', 'UUID', { isPrimary: true }),
      col('name', 'VARCHAR(120)'),
    ]),
    node('courses', 800, 0, [
      col('id', 'UUID', { isPrimary: true }),
      col('instructor_id', 'UUID', { isForeign: true, references: 'instructors.id' }),
      col('title', 'VARCHAR(255)'),
    ]),
    node('enrollments', 0, 200, [
      col('id', 'UUID', { isPrimary: true }),
      col('student_id', 'UUID', { isForeign: true, references: 'students.id' }),
      col('course_id', 'UUID', { isForeign: true, references: 'courses.id' }),
    ]),
    node('lessons', 400, 200, [
      col('id', 'UUID', { isPrimary: true }),
      col('course_id', 'UUID', { isForeign: true, references: 'courses.id' }),
      col('title', 'VARCHAR(255)'),
    ]),
    node('progress', 800, 200, [
      col('id', 'UUID', { isPrimary: true }),
      col('enrollment_id', 'UUID', { isForeign: true, references: 'enrollments.id' }),
      col('lesson_id', 'UUID', { isForeign: true, references: 'lessons.id' }),
      col('completed_at', 'TIMESTAMPTZ'),
    ]),
  ],
  edges: [
    edge('e1', 'courses', 'instructors', 'instructor_id', 'id', '1:N'),
    edge('e2', 'enrollments', 'students', 'student_id', 'id', '1:N'),
    edge('e3', 'enrollments', 'courses', 'course_id', 'id', '1:N'),
    edge('e4', 'lessons', 'courses', 'course_id', 'id', '1:N'),
    edge('e5', 'progress', 'enrollments', 'enrollment_id', 'id', '1:N'),
  ],
};

const COURSES_SQL = `-- Сгенерировано ER Database · диалект PostgreSQL
-- 6 таблиц · 5 связей

CREATE TABLE students (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE instructors (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL
);

CREATE TABLE courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES instructors(id),
  title         VARCHAR(255) NOT NULL
);

CREATE TABLE enrollments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id),
  UNIQUE (student_id, course_id)
);

CREATE TABLE lessons (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title     VARCHAR(255) NOT NULL
);

CREATE TABLE progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id     UUID NOT NULL REFERENCES lessons(id),
  completed_at  TIMESTAMPTZ
);
`;

// ─────────────────────────────────────────────────────────
// Schema 4: CRM лиды (8 таблиц / 9 связей), SQLite
// ─────────────────────────────────────────────────────────

const CRM_ER: ERData = {
  nodes: [
    node('users', 0, 0, [
      col('id', 'INTEGER', { isPrimary: true }),
      col('name', 'TEXT'),
    ]),
    node('companies', 400, 0, [
      col('id', 'INTEGER', { isPrimary: true }),
      col('name', 'TEXT'),
    ]),
    node('contacts', 800, 0, [
      col('id', 'INTEGER', { isPrimary: true }),
      col('company_id', 'INTEGER', { isForeign: true, references: 'companies.id' }),
      col('email', 'TEXT'),
    ]),
    node('stages', 0, 200, [
      col('id', 'INTEGER', { isPrimary: true }),
      col('name', 'TEXT'),
      col('position', 'INTEGER'),
    ]),
    node('leads', 400, 200, [
      col('id', 'INTEGER', { isPrimary: true }),
      col('contact_id', 'INTEGER', { isForeign: true, references: 'contacts.id' }),
      col('owner_id', 'INTEGER', { isForeign: true, references: 'users.id' }),
      col('source', 'TEXT'),
    ]),
    node('deals', 800, 200, [
      col('id', 'INTEGER', { isPrimary: true }),
      col('lead_id', 'INTEGER', { isForeign: true, references: 'leads.id' }),
      col('owner_id', 'INTEGER', { isForeign: true, references: 'users.id' }),
      col('amount', 'REAL'),
    ]),
    node('deal_stages', 0, 400, [
      col('deal_id', 'INTEGER', { isForeign: true, references: 'deals.id' }),
      col('stage_id', 'INTEGER', { isForeign: true, references: 'stages.id' }),
      col('entered_at', 'TEXT'),
    ]),
    node('activities', 400, 400, [
      col('id', 'INTEGER', { isPrimary: true }),
      col('deal_id', 'INTEGER', { isForeign: true, references: 'deals.id' }),
      col('user_id', 'INTEGER', { isForeign: true, references: 'users.id' }),
      col('kind', 'TEXT'),
      col('happened_at', 'TEXT'),
    ]),
  ],
  edges: [
    edge('e1', 'contacts', 'companies', 'company_id', 'id', '1:N'),
    edge('e2', 'leads', 'contacts', 'contact_id', 'id', '1:N'),
    edge('e3', 'leads', 'users', 'owner_id', 'id', '1:N'),
    edge('e4', 'deals', 'leads', 'lead_id', 'id', '1:N'),
    edge('e5', 'deals', 'users', 'owner_id', 'id', '1:N'),
    edge('e6', 'deal_stages', 'deals', 'deal_id', 'id', '1:N'),
    edge('e7', 'deal_stages', 'stages', 'stage_id', 'id', '1:N'),
    edge('e8', 'activities', 'deals', 'deal_id', 'id', '1:N'),
    edge('e9', 'activities', 'users', 'user_id', 'id', '1:N'),
  ],
};

const CRM_SQL = `-- Сгенерировано ER Database · диалект SQLite
-- 8 таблиц · 9 связей

CREATE TABLE users (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE companies (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER REFERENCES companies(id),
  email      TEXT NOT NULL
);

CREATE TABLE stages (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE leads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER REFERENCES contacts(id),
  owner_id   INTEGER REFERENCES users(id),
  source     TEXT
);

CREATE TABLE deals (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id  INTEGER REFERENCES leads(id),
  owner_id INTEGER REFERENCES users(id),
  amount   REAL NOT NULL
);

CREATE TABLE deal_stages (
  deal_id    INTEGER REFERENCES deals(id),
  stage_id   INTEGER REFERENCES stages(id),
  entered_at TEXT,
  PRIMARY KEY (deal_id, stage_id)
);

CREATE TABLE activities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id     INTEGER REFERENCES deals(id),
  user_id     INTEGER REFERENCES users(id),
  kind        TEXT NOT NULL,
  happened_at TEXT NOT NULL
);
`;

// ─────────────────────────────────────────────────────────
// MOCK_SAVED_SCHEMAS — 5 saved schemas
// Relative to today (2026-05-12)
// ─────────────────────────────────────────────────────────

export const MOCK_SAVED_SCHEMAS: SavedSchema[] = [
  {
    id: 'schema-billing-saas',
    name: 'Биллинг SaaS · подписки',
    description: 'Workspaces, пользователи, подписки, инвойсы и позиции.',
    er_data: BILLING_SAAS_ER_DATA,
    sql: BILLING_SAAS_SQL,
    sql_dialect: 'PostgreSQL',
    tags: tagsByNames(['billing', 'subscriptions']),
    is_published: true,
    fork_count: 47,
    notes: [],
    created_at: '2026-03-15T09:00:00Z',
    updated_at: '2026-05-12T12:00:00Z',
  },
  {
    id: 'schema-shop',
    name: 'Интернет-магазин с корзиной',
    description: 'Пользователи, товары, корзина, заказы, оплаты и адреса доставки.',
    er_data: SHOP_ER,
    sql: SHOP_SQL,
    sql_dialect: 'PostgreSQL',
    tags: tagsByNames(['shop', 'cart', 'orders']),
    is_published: false,
    fork_count: 0,
    notes: [],
    created_at: '2026-04-10T09:00:00Z',
    updated_at: '2026-05-11T18:30:00Z',
  },
  {
    id: 'schema-blog',
    name: 'Блог с тегами',
    description: 'Авторы, посты, теги и many-to-many связь через post_tags.',
    er_data: BLOG_ER,
    sql: BLOG_SQL,
    sql_dialect: 'MySQL',
    tags: tagsByNames(['blog', 'content']),
    is_published: false,
    fork_count: 0,
    notes: [],
    created_at: '2026-04-20T09:00:00Z',
    updated_at: '2026-05-09T10:00:00Z',
  },
  {
    id: 'schema-courses',
    name: 'Курсы и студенты',
    description: 'Студенты, курсы, преподаватели, зачисления, уроки и прогресс.',
    er_data: COURSES_ER,
    sql: COURSES_SQL,
    sql_dialect: 'PostgreSQL',
    tags: tagsByNames(['education', 'courses']),
    is_published: true,
    fork_count: 12,
    notes: [],
    created_at: '2026-04-01T09:00:00Z',
    updated_at: '2026-05-05T14:00:00Z',
  },
  {
    id: 'schema-crm',
    name: 'CRM лиды',
    description: 'Компании, контакты, лиды, сделки, стадии воронки и активности.',
    er_data: CRM_ER,
    sql: CRM_SQL,
    sql_dialect: 'SQLite',
    tags: tagsByNames(['crm', 'sales']),
    is_published: false,
    fork_count: 0,
    notes: [],
    created_at: '2026-03-20T09:00:00Z',
    updated_at: '2026-04-28T11:00:00Z',
  },
];
