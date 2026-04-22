export default function Logos() {
  const stack = ['PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'Oracle', 'Supabase', 'Prisma', 'Drizzle'];

  return (
    <section
      style={{
        padding: '40px 0 30px',
        borderTop: '1px solid var(--border-soft)',
        borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 30,
        }}
      >
        <div
          style={{
            color: 'var(--fg-mute)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            letterSpacing: 0.5,
          }}
        >
          ЭКСПОРТ В SQL-ДИАЛЕКТЫ И ORM
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 38, flexWrap: 'wrap' }}>
          {stack.map((name) => (
            <div
              key={name}
              style={{
                color: 'var(--fg-dim)',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: -0.2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                opacity: 0.75,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent-cyan)',
                  opacity: 0.5,
                }}
              />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
