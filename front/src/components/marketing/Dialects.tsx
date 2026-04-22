'use client';

import { useState } from 'react';
import SectionHeader from './SectionHeader';

interface Dialect {
  name: string;
  id: string;
  accent: string;
  snippet: string;
}

const DIALECTS: Dialect[] = [
  {
    name: 'PostgreSQL',
    id: 'pg',
    accent: 'var(--accent-cyan)',
    snippet: `id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
price DECIMAL(10,2),
tags JSONB,
created_at TIMESTAMPTZ`,
  },
  {
    name: 'MySQL',
    id: 'mysql',
    accent: '#f59e0b',
    snippet: `id INT AUTO_INCREMENT PRIMARY KEY,
price DECIMAL(10,2),
tags JSON,
created_at DATETIME`,
  },
  {
    name: 'SQLite',
    id: 'sqlite',
    accent: '#22c55e',
    snippet: `id INTEGER PRIMARY KEY AUTOINCREMENT,
price REAL,
tags TEXT,
created_at TEXT`,
  },
  {
    name: 'SQL Server',
    id: 'mssql',
    accent: 'var(--accent-blue)',
    snippet: `id INT IDENTITY(1,1) PRIMARY KEY,
price DECIMAL(10,2),
tags NVARCHAR(MAX),
created_at DATETIME2`,
  },
  {
    name: 'Oracle',
    id: 'oracle',
    accent: '#ef4444',
    snippet: `id NUMBER GENERATED ALWAYS AS IDENTITY,
price NUMBER(10,2),
tags CLOB,
created_at TIMESTAMP WITH TIME ZONE`,
  },
];

export default function Dialects() {
  const [active, setActive] = useState('pg');
  const cur = DIALECTS.find((d) => d.id === active)!;

  return (
    <section
      style={{
        padding: '60px 0 80px',
        background: 'var(--bg-soft)',
        borderTop: '1px solid var(--border-soft)',
        borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <div className="wrap">
        <SectionHeader
          eyebrow="5 диалектов"
          title="Один промпт, любой движок"
          description="Переключай диалект кнопкой — ERgen перепишет DDL целиком: от SERIAL до IDENTITY, от JSONB до NVARCHAR(MAX)."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }} className="dial-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DIALECTS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActive(d.id)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  background: active === d.id ? 'var(--card-bg)' : 'transparent',
                  border: '1px solid',
                  borderColor: active === d.id ? 'var(--card-border)' : 'transparent',
                  borderRadius: 10,
                  cursor: 'pointer',
                  color: active === d.id ? 'var(--foreground)' : 'var(--fg-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'all 160ms ease',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: d.accent,
                    boxShadow: active === d.id ? `0 0 10px ${d.accent}` : 'none',
                  }}
                />
                {d.name}
                {active === d.id && (
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--fg-mute)' }}>
                    ACTIVE
                  </span>
                )}
              </button>
            ))}
          </div>

          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--bg-soft)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: cur.accent,
                  boxShadow: `0 0 8px ${cur.accent}`,
                }}
              />
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)', letterSpacing: 0.5 }}>
                {cur.name.toUpperCase()} · products.sql
              </span>
              <span style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-mute)' }}>COPY · DOWNLOAD</span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '24px 28px',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                lineHeight: 1.8,
                color: 'var(--foreground)',
                minHeight: 220,
              }}
            >
              <span style={{ color: 'var(--fg-mute)' }}>-- products table — {cur.name}</span>
              {'\n'}
              <span style={{ color: 'var(--accent-purple)' }}>CREATE TABLE</span> products (<br />
              {cur.snippet.split('\n').map((line, i) => (
                <div key={i} style={{ paddingLeft: 16 }}>
                  {line
                    .replace(
                      /\b(PRIMARY KEY|DEFAULT|AUTO_INCREMENT|AUTOINCREMENT|IDENTITY|GENERATED|ALWAYS AS|NOT NULL)\b/g,
                      (m) => `⟪${m}⟫`,
                    )
                    .split(/⟪|⟫/)
                    .map((chunk, j) => {
                      const isKw = /^(PRIMARY KEY|DEFAULT|AUTO_INCREMENT|AUTOINCREMENT|IDENTITY|GENERATED|ALWAYS AS|NOT NULL)$/.test(chunk);
                      const isType =
                        /\b(UUID|INT|INTEGER|REAL|TEXT|NUMBER|DECIMAL|JSON|JSONB|NVARCHAR|CLOB|DATETIME2?|TIMESTAMP|TIMESTAMPTZ)\b/.test(chunk);
                      return isKw ? (
                        <span key={j} style={{ color: 'var(--accent-purple)' }}>
                          {chunk}
                        </span>
                      ) : isType ? (
                        <span key={j} style={{ color: cur.accent }}>
                          {chunk}
                        </span>
                      ) : (
                        <span key={j}>{chunk}</span>
                      );
                    })}
                </div>
              ))}
              <span>);</span>
            </pre>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .dial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
