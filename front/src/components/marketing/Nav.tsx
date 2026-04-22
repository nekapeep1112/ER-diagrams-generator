'use client';

import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: { label: string; href: string }[] = [
    { label: 'Возможности', href: '#features' },
    { label: 'Как работает', href: '#how' },
    { label: 'Демо', href: '#demo' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '14px 0',
        background: scrolled ? 'color-mix(in oklch, var(--background) 80%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px) saturate(1.2)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-soft)' : '1px solid transparent',
        transition: 'all 200ms ease',
      }}
    >
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 20px -6px var(--accent-cyan)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <rect x="3" y="4" width="7" height="7" rx="1.5" />
              <rect x="14" y="13" width="7" height="7" rx="1.5" />
              <path d="M10 7h2a2 2 0 0 1 2 2v4" strokeLinecap="round" strokeDasharray="2 2" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontWeight: 700, letterSpacing: -0.3, fontSize: 17 }}>ERgen</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-mute)' }}>/v2.1</span>
          </div>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-links">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{ color: 'var(--fg-dim)', textDecoration: 'none', fontSize: 13.5, fontWeight: 500 }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--fg-dim)')}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/dashboard" style={{ color: 'var(--fg-dim)', textDecoration: 'none', fontSize: 13.5, padding: '8px 14px' }}>
            Войти
          </a>
          <a
            href="/dashboard"
            style={{
              color: 'var(--background)',
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
              padding: '9px 16px',
              borderRadius: 8,
              background: 'var(--foreground)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Попробовать
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .nav-links { display: none !important; } }
      `}</style>
    </nav>
  );
}
