'use client';

import { useState } from 'react';
import SectionHeader from './SectionHeader';

export default function Faq() {
  const items = [
    {
      q: 'Мои данные улетают в OpenAI?',
      a: 'Только текст промпта. Никаких подключений к твоей реальной БД — мы работаем только со схемой, которую ты описываешь словами.',
    },
    {
      q: 'Можно ли редактировать схему после генерации?',
      a: 'Да. Таблицы двигаются drag-n-drop, а диалог с AI сохраняет контекст — говоришь «добавь поле email» и схема обновляется прямо на canvas.',
    },
    {
      q: 'Что если GPT придумает кривую схему?',
      a: 'Системный промпт жёстко валидирует: PK/FK, типы, кардинальность 1:1/1:N/M:N. Для many-to-many сам создаёт junction-таблицу.',
    },
    {
      q: 'Можно ли экспортнуть в Prisma или Drizzle?',
      a: 'Сейчас — только в SQL-диалекты (PostgreSQL, MySQL, SQLite, SQL Server, Oracle). Prisma и Drizzle в планах.',
    },
    {
      q: 'Подойдёт для продакшена?',
      a: 'Для прототипов, ТЗ и «schema-first»-подхода — да. Для продакшн-миграций прогони ddl через review и свою CI — это всё же код от AI.',
    },
    {
      q: 'Работает без VPN из России?',
      a: 'Да, backend в РФ, OpenAI — через прокси. Логин через GitHub OAuth или dev-режим.',
    },
  ];

  const [open, setOpen] = useState(0);

  return (
    <section id="faq" style={{ padding: '60px 0 80px' }}>
      <div className="wrap" style={{ maxWidth: 900 }}>
        <SectionHeader eyebrow="FAQ" title="Что обычно спрашивают" />
        <div
          style={{
            border: '1px solid var(--card-border)',
            borderRadius: 14,
            background: 'var(--card-bg)',
            overflow: 'hidden',
          }}
        >
          {items.map((it, i) => (
            <div key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--card-border)' }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '20px 24px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 20,
                  color: 'var(--foreground)',
                  fontSize: 15.5,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="mono" style={{ color: 'var(--fg-mute)', fontSize: 12 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {it.q}
                </span>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '1px solid var(--card-border)',
                    display: 'grid',
                    placeItems: 'center',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease',
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              {open === i && (
                <div
                  style={{
                    padding: '0 24px 22px 60px',
                    color: 'var(--fg-dim)',
                    fontSize: 14.5,
                    lineHeight: 1.65,
                    animation: 'mkt-fade-in-up 260ms ease-out',
                  }}
                >
                  {it.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
