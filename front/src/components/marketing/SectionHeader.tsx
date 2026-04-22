interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: align === 'center' ? '0 auto 56px' : '0 0 56px',
        textAlign: align,
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: 'var(--accent-cyan)',
          letterSpacing: 1.5,
          marginBottom: 14,
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ width: 16, height: 1, background: 'var(--accent-cyan)' }} />
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: 'clamp(32px, 4.5vw, 56px)',
          lineHeight: 1.02,
          letterSpacing: -0.025 * 56,
          fontWeight: 700,
          margin: 0,
          marginBottom: 18,
          textWrap: 'balance',
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: 17,
            color: 'var(--fg-dim)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 620,
            textWrap: 'pretty',
            marginLeft: align === 'center' ? 'auto' : 0,
            marginRight: align === 'center' ? 'auto' : 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
