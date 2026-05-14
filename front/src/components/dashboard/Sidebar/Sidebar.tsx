'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { getInitials } from '@/lib/mocks';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { Chat } from '@/types';
import { ChatListItem } from './ChatListItem';
import styles from './Sidebar.module.css';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCreateChat?: () => void;
  creatingChat?: boolean;
  onRenameChat?: (id: string, title: string) => Promise<void> | void;
  onDeleteChat?: (id: string) => Promise<void> | void;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  collapsed,
  onToggleCollapse,
  onCreateChat,
  creatingChat,
  onRenameChat,
  onDeleteChat,
}: SidebarProps) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const filteredChats = deferredSearch
    ? chats.filter((c) => c.title.toLowerCase().includes(deferredSearch.toLowerCase()))
    : chats;

  const username = currentUser?.username ?? 'Гость';
  const email = currentUser?.email ?? '';
  const initials = getInitials(username);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.top}>
        {collapsed ? (
          <div className={styles.collapsedTop}>
            <Tooltip content="Развернуть (⌘B)" side="right">
              <button
                type="button"
                className={styles.collapseBtn}
                onClick={onToggleCollapse}
                aria-label="Развернуть боковую панель"
              >
                <Icon name="panel-left" size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Новый чат" side="right">
              <button
                type="button"
                className={styles.newChatCompact}
                onClick={onCreateChat}
                disabled={creatingChat || !onCreateChat}
                aria-label="Новый чат"
              >
                <Icon name="plus" size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Моя библиотека" side="right">
              <Link
                href="/library"
                className={styles.newChatCompact}
                aria-label="Моя библиотека"
              >
                <Icon name="database" size={16} />
              </Link>
            </Tooltip>
          </div>
        ) : (
          <>
            <div className={styles.brandRow}>
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  color: 'inherit',
                  flex: 1,
                  minWidth: 0,
                }}
                aria-label="На главную"
              >
                <BrandMark size={22} />
                <span className={styles.brandName}>ER Database</span>
              </Link>
              <button
                type="button"
                className={styles.collapseBtn}
                onClick={onToggleCollapse}
                aria-label="Свернуть боковую панель"
              >
                <Icon name="panel-left" size={16} />
              </button>
            </div>
            <div className={styles.searchWrap}>
              <Icon name="search" size={14} className={styles.searchIcon} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск чатов"
                className={styles.search}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              icon="plus"
              onClick={onCreateChat}
              loading={creatingChat}
              disabled={creatingChat || !onCreateChat}
              className={styles.newChatBtn}
            >
              Новый чат
            </Button>
            <Link
              href="/library"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                marginTop: 8,
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--text-secondary, #999)',
                textDecoration: 'none',
                transition: 'background 120ms, color 120ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-2, #1a1a1a)';
                e.currentTarget.style.color = 'var(--text-primary, #fff)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary, #999)';
              }}
            >
              <Icon name="database" size={14} />
              <span>Моя библиотека</span>
            </Link>
          </>
        )}
      </div>

      <div className={styles.chatsSection}>
        {!collapsed && <div className={`micro ${styles.sectionLabel}`}>Чаты</div>}
        <ul className={styles.chatList}>
          {filteredChats.length === 0 ? (
            <li className={styles.empty}>
              <Icon name="search-x" size={20} />
              <span>Ничего не найдено</span>
            </li>
          ) : (
            filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                collapsed={collapsed}
                onClick={() => onSelectChat(chat.id)}
                onRename={onRenameChat}
                onDelete={onDeleteChat}
              />
            ))
          )}
        </ul>
      </div>

      <div className={styles.bottom}>
        {collapsed ? (
          <Tooltip content={username} side="right">
            <button
              type="button"
              className={styles.userPillCompact}
              onClick={() => toast.info('Меню профиля появится позже')}
              aria-label="Профиль"
            >
              <Avatar initials={initials} size={28} />
            </button>
          </Tooltip>
        ) : (
          <Dropdown
            align="left"
            direction="up"
            trigger={
              <button type="button" className={styles.userPill}>
                <Avatar initials={initials} size={28} />
                <span className={styles.userInfo}>
                  <span className={styles.userName}>{username}</span>
                  <span className={styles.userEmail}>{email}</span>
                </span>
                <Icon name="chevron-up" size={14} />
              </button>
            }
          >
            <Link href="/library" className={styles.menuItem}>
              <Icon name="database" size={14} />
              <span>Моя библиотека</span>
            </Link>
            <Link href="/profile" className={styles.menuItem}>
              <Icon name="users" size={14} />
              <span>Профиль</span>
            </Link>
            <Link href="/pricing" className={styles.menuItem}>
              <Icon name="bookmark" size={14} />
              <span>Тарифы</span>
            </Link>
            <div className={styles.menuDivider} />
            <button
              type="button"
              className={styles.menuItem}
              onClick={handleLogout}
            >
              <Icon name="external-link" size={14} />
              <span>Выйти</span>
            </button>
          </Dropdown>
        )}
      </div>
    </aside>
  );
}
