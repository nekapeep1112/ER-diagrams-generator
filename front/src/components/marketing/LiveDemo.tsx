'use client';

import { useState } from 'react';
import SectionHeader from './SectionHeader';
import MiniDiagram, { type MiniData } from './MiniDiagram';

const ECOMMERCE: MiniData = {
  nodes: [
    {
      id: 'customers',
      position: { x: 20, y: 30 },
      delay: 0,
      data: {
        tableName: 'customers',
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'email', type: 'VARCHAR(255)' },
          { name: 'full_name', type: 'VARCHAR(120)' },
        ],
      },
    },
    {
      id: 'orders',
      position: { x: 290, y: 30 },
      delay: 120,
      data: {
        tableName: 'orders',
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'customer_id', type: 'UUID', isForeign: true },
          { name: 'total', type: 'DECIMAL(10,2)' },
          { name: 'status', type: 'VARCHAR(20)' },
        ],
      },
    },
    {
      id: 'order_items',
      position: { x: 560, y: 30 },
      delay: 240,
      data: {
        tableName: 'order_items',
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'order_id', type: 'UUID', isForeign: true },
          { name: 'product_id', type: 'UUID', isForeign: true },
          { name: 'qty', type: 'INTEGER' },
        ],
      },
    },
    {
      id: 'products',
      position: { x: 560, y: 230 },
      delay: 360,
      data: {
        tableName: 'products',
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'sku', type: 'VARCHAR(50)' },
          { name: 'name', type: 'VARCHAR(200)' },
          { name: 'price', type: 'DECIMAL(10,2)' },
        ],
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'orders', target: 'customers', sourceHandle: 'customer_id', targetHandle: 'id', label: 'N:1' },
    { id: 'e2', source: 'order_items', target: 'orders', sourceHandle: 'order_id', targetHandle: 'id', label: 'N:1' },
    { id: 'e3', source: 'order_items', target: 'products', sourceHandle: 'product_id', targetHandle: 'id', label: 'N:1' },
  ],
};

const SQL_POSTGRES = `-- customers
CREATE TABLE customers (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL UNIQUE,
    full_name  VARCHAR(120) NOT NULL
);

-- orders
CREATE TABLE orders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    total       DECIMAL(10,2) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
);

-- order_items
CREATE TABLE order_items (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    qty        INTEGER NOT NULL CHECK (qty > 0)
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_items_order     ON order_items(order_id);`;

const PROMPT_DEMO = 'Сделай схему для e-commerce: клиенты, заказы, позиции заказа и каталог товаров';

function Code({ code }: { code: string }) {
  const keywords = /\b(CREATE|TABLE|PRIMARY|KEY|NOT|NULL|UNIQUE|DEFAULT|REFERENCES|ON|DELETE|CASCADE|CHECK|INDEX)\b/g;
  const types = /\b(UUID|VARCHAR|DECIMAL|INTEGER|TEXT|TIMESTAMP|BOOLEAN|SERIAL)\b(\(\d+(?:,\d+)?\))?/g;
  const comment = /(--[^\n]*)/g;
  const str = /('[^']*')/g;

  const html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(comment, '<span style="color:var(--fg-mute)">$1</span>')
    .replace(keywords, '<span style="color:var(--accent-purple)">$&</span>')
    .replace(types, '<span style="color:var(--accent-cyan)">$&</span>')
    .replace(str, '<span style="color:rgb(245 197 24)">$1</span>');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function LiveDemo() {
  const [tab, setTab] = useState<'diagram' | 'sql' | 'json'>('diagram');

  const tabs: { id: 'diagram' | 'sql' | 'json'; label: string; hint: string }[] = [
    { id: 'diagram', label: 'Diagram', hint: 'ER-canvas' },
    { id: 'sql', label: 'SQL', hint: 'PostgreSQL DDL' },
    { id: 'json', label: 'JSON', hint: 'er_data' },
  ];

  return (
    <section id="demo" style={{ padding: '60px 0 80px' }}>
      <div className="wrap">
        <SectionHeader
          eyebrow="Живое демо"
          title="Один промпт — три артефакта"
          description="Диаграмма, SQL и машинно-читаемый JSON — всё из одного запроса. Переключай вкладки ниже."
        />

        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 18,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--card-border)',
              background: 'var(--bg-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-mute)', letterSpacing: 1 }}>PROMPT</span>
            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 12.5, marginRight: 6 }}>$</span>
            <span style={{ color: 'var(--foreground)', fontSize: 14, flex: 1, minWidth: 200 }}>{PROMPT_DEMO}</span>
            <span
              className="mono"
              style={{
                fontSize: 10.5,
                color: 'var(--ok)',
                letterSpacing: 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 6px var(--ok)' }} />
              200 OK · 1.8s
            </span>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', background: 'var(--bg-soft)' }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? 'var(--card-bg)' : 'transparent',
                  border: 'none',
                  padding: '14px 22px',
                  color: tab === t.id ? 'var(--foreground)' : 'var(--fg-mute)',
                  borderRight: '1px solid var(--card-border)',
                  borderBottom: tab === t.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  marginBottom: -1,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 10,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {t.label}
                <span style={{ fontSize: 10.5, color: 'var(--fg-mute)' }}>{t.hint}</span>
              </button>
            ))}
            <div style={{ flex: 1, borderBottom: '1px solid var(--card-border)' }} />
          </div>

          <div style={{ height: 560, position: 'relative', background: 'var(--bg-soft)' }}>
            {tab === 'diagram' && (
              <div className="bg-dots" style={{ width: '100%', height: '100%', padding: 20, overflow: 'auto' }}>
                <MiniDiagram data={ECOMMERCE} width={800} height={480} />
              </div>
            )}
            {tab === 'sql' && (
              <pre
                style={{
                  margin: 0,
                  padding: 24,
                  height: '100%',
                  overflow: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'var(--foreground)',
                  whiteSpace: 'pre',
                }}
              >
                <Code code={SQL_POSTGRES} />
              </pre>
            )}
            {tab === 'json' && (
              <pre
                style={{
                  margin: 0,
                  padding: 24,
                  height: '100%',
                  overflow: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  color: 'var(--fg-dim)',
                }}
              >
                {JSON.stringify(ECOMMERCE, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
