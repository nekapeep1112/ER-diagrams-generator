'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/mocks/user';
import styles from './PublicNav.module.css';

const NAV_LINKS = [
  { href: '/templates', label: 'Шаблоны' },
  { href: '/pricing', label: 'Тарифы' },
  { href: '/docs', label: 'Документация' },
];

export function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <BrandMark size={22} />
          <span>ER Database</span>
        </Link>
        <div className={styles.links}>
          {NAV_LINKS.map((l) => {
            const active = pathname?.startsWith(l.href) ?? false;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.link} ${active ? styles.active : ''}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className={styles.right}>
          {!isInitialized ? null : user ? (
            <>
              <Button variant="primary" as="a" href="/dashboard">В дашборд</Button>
              <Dropdown
                align="right"
                trigger={
                  <button
                    type="button"
                    aria-label="Меню пользователя"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: 4,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                  >
                    <Avatar initials={getInitials(user.username)} size={28} />
                    <Icon name="chevron-down" size={14} />
                  </button>
                }
              >
                <Link href="/dashboard" className={styles.link} role="menuitem" style={{ display: 'block', padding: '8px 14px' }}>
                  Дашборд
                </Link>
                <Link href="/library" className={styles.link} role="menuitem" style={{ display: 'block', padding: '8px 14px' }}>
                  Моя библиотека
                </Link>
                <Link href="/profile" className={styles.link} role="menuitem" style={{ display: 'block', padding: '8px 14px' }}>
                  Профиль
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.link}
                  role="menuitem"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 14px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                    fontSize: 'inherit',
                  }}
                >
                  Выйти
                </button>
              </Dropdown>
            </>
          ) : (
            <>
              <Button variant="ghost-sm" as="a" href="/login">Войти</Button>
              <Button variant="primary" as="a" href="/register">Регистрация</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
