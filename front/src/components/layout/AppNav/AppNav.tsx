'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/components/ui/BrandMark';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/mocks/user';
import styles from './AppNav.module.css';

export function AppNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const username = user?.username ?? 'Гость';
  const initials = getInitials(username);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <BrandMark size={22} />
          <span>ER Database</span>
        </Link>
        <Dropdown
          align="right"
          trigger={
            <button className={styles.userPill} type="button" aria-label="Меню пользователя">
              <Avatar initials={initials} size={28} />
              <Icon name="chevron-down" size={14} />
            </button>
          }
        >
          <Link href="/profile" className={styles.menuItem} role="menuitem">Профиль</Link>
          <Link href="/library" className={styles.menuItem} role="menuitem">Моя библиотека</Link>
          <Link href="/pricing" className={styles.menuItem} role="menuitem">Тарифы</Link>
          <div className={styles.divider} role="separator" />
          <button type="button" className={styles.menuItem} role="menuitem" onClick={handleLogout}>
            Выйти
          </button>
        </Dropdown>
      </div>
    </nav>
  );
}
