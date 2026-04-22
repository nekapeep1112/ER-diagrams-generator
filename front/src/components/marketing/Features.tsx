import SectionHeader from './SectionHeader';

interface FeatureItem {
  title: string;
  desc: string;
  badge?: string;
  span?: number;
  code?: boolean;
}

export default function Features() {
  const items: FeatureItem[] = [
    {
      title: 'Интерактивный ER-canvas',
      desc: 'Таблицы можно двигать, связи перерисовываются в реальном времени. Не PDF, не картинка — рабочий инструмент.',
      code: true,
      span: 2,
    },
    {
      title: 'Понимает кардинальность',
      desc: '1:1, 1:N, M:N. Для many-to-many сам создаёт junction-таблицу с двумя FK.',
      badge: 'AUTO',
    },
    {
      title: 'Библиотека схем',
      desc: 'Сохраняй удачные схемы и переиспользуй — как сниппеты, только для БД.',
      badge: 'SAVED',
    },
    {
      title: '5 диалектов SQL',
      desc: 'SERIAL → AUTO_INCREMENT → IDENTITY — переключается одним кликом без ручной миграции.',
      badge: 'DDL',
      span: 2,
    },
    { title: 'GitHub OAuth', desc: 'Логин в два клика. JWT в localStorage, никаких паролей.', badge: 'OAUTH' },
    { title: 'Экспорт PNG', desc: 'Скриншот canvas в 2x для ТЗ, Notion, Linear.', badge: 'IMG' },
  ];

  return (
    <section id="features" style={{ padding: '60px 0 80px' }}>
      <div className="wrap">
        <SectionHeader
          eyebrow="Возможности"
          title="Не очередной GPT-wrapper. Инструмент для инженеров."
          description="Построено вокруг реального воркфлоу: от набросков к миграциям. Каждая фича — ответ на конкретную боль."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="feat-grid">
          {items.map((f, i) => (
            <div
              key={i}
              className="feat-card"
              style={{
                gridColumn: f.span ? `span ${f.span}` : 'span 1',
                padding: 26,
                border: '1px solid var(--card-border)',
                background: f.code ? 'var(--bg-soft)' : 'var(--card-bg)',
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 200,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {f.badge && (
                <span
                  className="mono"
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    fontSize: 10,
                    color: 'var(--fg-mute)',
                    letterSpacing: 1,
                    padding: '2px 7px',
                    border: '1px solid var(--card-border)',
                    borderRadius: 4,
                  }}
                >
                  {f.badge}
                </span>
              )}
              <h3
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: -0.015 * 19,
                  lineHeight: 1.3,
                  maxWidth: f.code ? '55%' : '80%',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--fg-dim)',
                  lineHeight: 1.55,
                  margin: 0,
                  maxWidth: f.code ? '55%' : 'none',
                }}
              >
                {f.desc}
              </p>

              {f.code && (
                <div
                  style={{
                    position: 'absolute',
                    right: -20,
                    top: 40,
                    bottom: 10,
                    width: '48%',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 10,
                    padding: 16,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11.5,
                    color: 'var(--fg-dim)',
                    lineHeight: 1.7,
                    boxShadow: '0 0 30px -10px var(--accent-cyan)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    {['#ef4444', '#f5c518', '#22c55e'].map((c) => (
                      <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.5 }} />
                    ))}
                  </div>
                  <pre style={{ margin: 0, color: 'var(--fg-dim)' }}>
                    <span style={{ color: 'var(--accent-purple)' }}>{`<ReactFlow`}</span>
                    {`\n  `}
                    <span style={{ color: 'var(--accent-cyan)' }}>nodes</span>
                    {'='}
                    <span style={{ color: 'var(--foreground)' }}>{'{er.nodes}'}</span>
                    {`\n  `}
                    <span style={{ color: 'var(--accent-cyan)' }}>edges</span>
                    {'='}
                    <span style={{ color: 'var(--foreground)' }}>{'{er.edges}'}</span>
                    {`\n  `}
                    <span style={{ color: 'var(--accent-cyan)' }}>fitView</span>
                    {'\n'}
                    <span style={{ color: 'var(--accent-purple)' }}>{`/>`}</span>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .feat-grid { grid-template-columns: 1fr !important; }
          .feat-card { grid-column: span 1 !important; }
          .feat-card pre { display: none; }
        }
      `}</style>
    </section>
  );
}
