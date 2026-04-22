export default function Footer() {
  return (
    <>
      <section
        id="cta"
        style={{
          padding: '80px 0 100px',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid var(--border-soft)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 100%, color-mix(in oklch, var(--accent-cyan) 20%, transparent), transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="bg-grid"
          style={{
            position: 'absolute',
            inset: 0,
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
          }}
        />

        <div className="wrap" style={{ position: 'relative', textAlign: 'center' }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: 'var(--accent-cyan)',
              letterSpacing: 2,
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            // READY_TO_SHIP
          </div>
          <h2
            style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              lineHeight: 0.98,
              margin: 0,
              marginBottom: 20,
              letterSpacing: -0.035 * 72,
              fontWeight: 700,
              maxWidth: 900,
              marginInline: 'auto',
              textWrap: 'balance',
            }}
          >
            Первый{' '}
            <span
              className="serif"
              style={{
                fontWeight: 400,
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              CREATE&nbsp;TABLE
            </span>{' '}
            через 30 секунд.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: 'var(--fg-dim)',
              maxWidth: 540,
              margin: '0 auto 40px',
              lineHeight: 1.55,
            }}
          >
            Логинишься через GitHub, пишешь первый промпт — и получаешь рабочую схему ещё до того, как закроешь тикет.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="/dashboard"
              style={{
                padding: '16px 26px',
                borderRadius: 12,
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                color: 'white',
                fontWeight: 600,
                fontSize: 15.5,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 14px 44px -14px var(--accent-cyan)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.3-1.4-1.7-1.4-1.7-1.1-.8.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.3-3.2-.2-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
              </svg>
              Войти через GitHub
            </a>
            <a
              href="#demo"
              style={{
                padding: '16px 22px',
                borderRadius: 12,
                background: 'transparent',
                color: 'var(--foreground)',
                border: '1px solid var(--card-border)',
                fontWeight: 500,
                fontSize: 15.5,
                textDecoration: 'none',
              }}
            >
              Сначала попробовать демо
            </a>
          </div>
          <div style={{ marginTop: 22, fontSize: 12.5, color: 'var(--fg-mute)' }}>
            Полностью бесплатно · без ограничений
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: '40px 0 60px',
          borderTop: '1px solid var(--border-soft)',
          color: 'var(--fg-mute)',
          fontSize: 13,
        }}
      >
        <div
          className="wrap"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 30,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                }}
              />
              <span style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: 15 }}>ERgen</span>
            </div>
            <div style={{ maxWidth: 280, lineHeight: 1.6 }}>
              Django · Next.js 16 · React 19 · @xyflow/react · OpenAI GPT-4o
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 60 }} className="foot-cols">
            <div>
              <div className="mono" style={{ color: 'var(--foreground)', fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>ПРОДУКТ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Возможности</a>
                <a href="#demo" style={{ color: 'inherit', textDecoration: 'none' }}>Демо</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Changelog</a>
              </div>
            </div>
            <div>
              <div className="mono" style={{ color: 'var(--foreground)', fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>РЕСУРСЫ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>API docs</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Примеры схем</a>
                <a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Блог</a>
              </div>
            </div>
            <div>
              <div className="mono" style={{ color: 'var(--foreground)', fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>КОНТАКТЫ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Telegram</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>hello@ergen.dev</a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="wrap"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 48,
            paddingTop: 20,
            borderTop: '1px solid var(--border-soft)',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>© 2026 ERgen. Сделано с любовью к CREATE TABLE.</div>
          <div className="mono" style={{ letterSpacing: 0.5 }}>
            STATUS: <span style={{ color: 'var(--ok)' }}>●</span> все системы работают
          </div>
        </div>
      </footer>
      <style>{`
        @media (max-width: 720px) {
          .foot-cols { grid-template-columns: repeat(2, auto) !important; gap: 30px !important; }
        }
      `}</style>
    </>
  );
}
