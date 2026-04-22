import SectionHeader from './SectionHeader';

export default function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Пиши промпт как человеку',
      body: '«База для маркетплейса со складом и отзывами». Без диаграмм, без UML. Мы поймём домен и посоветуем связи.',
      tag: 'INPUT',
      kicker: 'ru/en · до 2000 слов',
    },
    {
      n: '02',
      title: 'Смотри, как строится схема',
      body: 'GPT-4o раскладывает таблицы на canvas @xyflow. Primary keys, foreign keys и кардинальность проставляются автоматически.',
      tag: 'GENERATE',
      kicker: '~6-12 секунд',
    },
    {
      n: '03',
      title: 'Забирай готовый DDL',
      body: 'Экспортируй SQL под свой диалект, сохраняй схему в библиотеку или скачивай PNG для Notion и ТЗ.',
      tag: 'EXPORT',
      kicker: 'PostgreSQL · MySQL · SQLite · MSSQL · Oracle',
    },
  ];

  return (
    <section id="how" style={{ padding: '120px 0 60px', position: 'relative' }}>
      <div className="wrap">
        <SectionHeader
          eyebrow="Как это работает"
          title="От идеи в голове до CREATE TABLE за 10 секунд"
          description="Никаких миграций от руки, никакого drag-n-drop по canvas. Ты описываешь — мы печатаем DDL."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="how-grid">
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                position: 'relative',
                padding: 28,
                border: '1px solid var(--card-border)',
                background: 'var(--card-bg)',
                borderRadius: 14,
                minHeight: 240,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 42,
                    fontWeight: 600,
                    color: 'transparent',
                    WebkitTextStroke: '1px var(--fg-mute)',
                    letterSpacing: -2,
                  }}
                >
                  {s.n}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: 'var(--accent-cyan)',
                    letterSpacing: 1,
                    padding: '3px 8px',
                    border: '1px solid color-mix(in oklch, var(--accent-cyan) 40%, transparent)',
                    borderRadius: 4,
                  }}
                >
                  {s.tag}
                </span>
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 10,
                  letterSpacing: -0.02 * 20,
                  lineHeight: 1.25,
                }}
              >
                {s.title}
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--fg-dim)', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 28,
                  fontSize: 11,
                  color: 'var(--fg-mute)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                → {s.kicker}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
