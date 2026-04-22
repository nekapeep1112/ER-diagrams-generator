'use client';

import { useEffect, useState } from 'react';
import MiniDiagram, { type MiniData } from './MiniDiagram';
import Button from '@/components/ui/Button';

const ER_BLOG: MiniData = {
  nodes: [
    {
      id: 'users',
      delay: 0,
      position: { x: 30, y: 70 },
      data: {
        tableName: 'users',
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'handle', type: 'VARCHAR(32)' },
          { name: 'email', type: 'VARCHAR(255)' },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
      },
    },
    {
      id: 'posts',
      delay: 180,
      position: { x: 380, y: 40 },
      data: {
        tableName: 'posts',
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'author_id', type: 'UUID', isForeign: true },
          { name: 'title', type: 'VARCHAR(200)' },
          { name: 'body', type: 'TEXT' },
          { name: 'published_at', type: 'TIMESTAMP' },
        ],
      },
    },
    {
      id: 'comments',
      delay: 360,
      position: { x: 380, y: 260 },
      data: {
        tableName: 'comments',
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'post_id', type: 'UUID', isForeign: true },
          { name: 'author_id', type: 'UUID', isForeign: true },
          { name: 'body', type: 'TEXT' },
        ],
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'posts', target: 'users', sourceHandle: 'author_id', targetHandle: 'id', label: 'N:1' },
    { id: 'e2', source: 'comments', target: 'posts', sourceHandle: 'post_id', targetHandle: 'id', label: 'N:1' },
    { id: 'e3', source: 'comments', target: 'users', sourceHandle: 'author_id', targetHandle: 'id', label: 'N:1' },
  ],
};

function TypewriterPrompt({ text, onDone }: { text: string; onDone?: () => void }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setTimeout(() => onDone && onDone(), 400);
      }
    }, 28);
    return () => clearInterval(id);
  }, [text, onDone]);
  return (
    <span>
      {shown}
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 15,
          background: 'var(--accent-cyan)',
          verticalAlign: 'text-bottom',
          marginLeft: 2,
          animation: 'mkt-caret 900ms infinite step-end',
        }}
      />
    </span>
  );
}

export default function Hero() {
  const [pulse, setPulse] = useState(0);

  return (
    <section style={{ position: 'relative', paddingTop: 120, paddingBottom: 80, overflow: 'hidden' }}>
      <div
        className="bg-grid"
        style={{
          position: 'absolute',
          inset: 0,
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -80,
          left: '10%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, color-mix(in oklch, var(--accent-cyan) 22%, transparent), transparent 65%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 100,
          right: '8%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, color-mix(in oklch, var(--accent-purple) 18%, transparent), transparent 65%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div className="wrap" style={{ position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 12px',
            border: '1px solid var(--card-border)',
            borderRadius: 999,
            background: 'color-mix(in oklch, var(--card-bg) 60%, transparent)',
            backdropFilter: 'blur(8px)',
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--ok)',
              boxShadow: '0 0 8px var(--ok)',
              animation: 'mkt-pulse-dot 1.4s ease-in-out infinite',
            }}
          />
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)', letterSpacing: 0.5 }}>
            GPT-4o · 5 SQL ДИАЛЕКТОВ · BETA
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(44px, 7vw, 96px)',
            lineHeight: 0.95,
            letterSpacing: -0.04 * 96,
            fontWeight: 800,
            margin: 0,
            marginBottom: 28,
            maxWidth: 1100,
            textWrap: 'balance',
          }}
        >
          Проектируй&nbsp;базы <br />
          данных&nbsp;
          <span
            className="serif"
            style={{
              fontWeight: 400,
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: -0.02,
            }}
          >
            словами
          </span>
          .
        </h1>

        <p
          style={{
            fontSize: 19,
            color: 'var(--fg-dim)',
            maxWidth: 620,
            lineHeight: 1.55,
            margin: 0,
            marginBottom: 40,
            textWrap: 'pretty',
          }}
        >
          Опиши предметную область на русском — ERgen нарисует интерактивную ER-диаграмму и сгенерирует SQL под твой диалект. Никаких drag-n-drop и часов в dbdiagram.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 72 }}>
          <a
            href="#cta"
            style={{ textDecoration: 'none', boxShadow: '0 12px 40px -14px var(--accent-cyan)', borderRadius: 10 }}
          >
            <Button variant="primary" className="!px-[22px] !py-[14px] !rounded-[10px] !text-[15px]">
              Начать бесплатно
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Button>
          </a>
          <a
            href="#demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              borderRadius: 10,
              background: 'transparent',
              color: 'var(--foreground)',
              fontWeight: 500,
              fontSize: 15,
              textDecoration: 'none',
              border: '1px solid var(--card-border)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Смотреть демо — 90 сек
          </a>
          <span style={{ color: 'var(--fg-mute)', fontSize: 13, marginLeft: 4 }}>· полностью бесплатно</span>
        </div>

        <div
          style={{ position: 'relative', display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}
          className="hero-canvas"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                alignSelf: 'flex-end',
                background:
                  'linear-gradient(135deg, color-mix(in oklch, var(--accent-cyan) 20%, var(--card-bg)), color-mix(in oklch, var(--accent-purple) 20%, var(--card-bg)))',
                border: '1px solid var(--card-border)',
                borderRadius: '14px 14px 2px 14px',
                padding: '10px 14px',
                fontSize: 13.5,
                maxWidth: 310,
                color: 'var(--foreground)',
                lineHeight: 1.45,
              }}
            >
              <TypewriterPrompt
                text="Нужна база для блога: юзеры, посты и комментарии. Комментарии могут быть вложенными."
                onDone={() => setPulse(Date.now())}
              />
            </div>

            <div
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '14px 14px 14px 2px',
                padding: '12px 14px',
                fontSize: 13.5,
                color: 'var(--fg-dim)',
                lineHeight: 1.55,
                animation: 'mkt-fade-in-up 500ms 1400ms backwards',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>E</span>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-mute)' }}>ERGEN</span>
              </div>
              Готово. 3 таблицы, 3 связи N:1. Комментарии ссылаются на пост и автора, плюс на родителя для тредов.
            </div>

            <div
              style={{
                background: 'linear-gradient(180deg, var(--card-bg), var(--surface-2))',
                border: '1px solid var(--card-border)',
                borderRadius: 16,
                padding: 12,
                animation: 'mkt-fade-in-up 500ms 1700ms backwards',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--fg-mute)', padding: '6px 4px 10px' }}>
                Продолжить диалог...
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, borderTop: '1px solid var(--card-border)' }}>
                <button
                  style={{
                    fontSize: 10.5,
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: 'var(--bg-soft)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--fg-dim)',
                    fontFamily: 'var(--font-mono)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  PostgreSQL
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div style={{ flex: 1 }} />
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 16px -4px var(--accent-cyan)',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              background: 'var(--bg-soft)',
              border: '1px solid var(--card-border)',
              borderRadius: 18,
              overflow: 'hidden',
              height: 500,
            }}
            className="bg-dots"
          >
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ef4444', '#f5c518', '#22c55e'].map((c) => (
                  <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.55 }} />
                ))}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: 'var(--fg-mute)',
                  letterSpacing: 0.5,
                  padding: '4px 8px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 6,
                }}
              >
                ER-CANVAS · BLOG.V1
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['FIT', 'PNG', 'SQL'].map((t) => (
                  <span
                    key={t}
                    className="mono"
                    style={{
                      fontSize: 9.5,
                      color: 'var(--fg-mute)',
                      padding: '4px 7px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: 6,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ position: 'absolute', top: 50, left: 10 }}>
              <MiniDiagram data={ER_BLOG} width={740} height={440} pulse={pulse} />
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                display: 'flex',
                gap: 18,
                padding: '6px 14px',
                background: 'color-mix(in oklch, var(--card-bg) 85%, transparent)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--card-border)',
                borderRadius: 8,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-dim)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgb(245 197 24)' }} />
                Primary
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-dim)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                Foreign
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-dim)' }}>
                <span style={{ width: 12, height: 2, background: 'var(--accent-cyan)', borderRadius: 1 }} />
                Relation N:1
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-canvas { grid-template-columns: 1fr !important; }
          .hero-canvas > div:last-child { height: 420px !important; overflow: auto !important; }
        }
      `}</style>
    </section>
  );
}
