'use client';

import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { relativeTime } from '@/lib/relativeTime';
import type { Chat } from '@/types';
import styles from './ChatListItem.module.css';

interface ChatListItemProps {
  chat: Chat;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  onRename?: (id: string, title: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

export function ChatListItem({
  chat,
  active,
  collapsed,
  onClick,
  onRename,
  onDelete,
}: ChatListItemProps) {
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(chat.title);

  if (collapsed) {
    return (
      <li>
        <Tooltip content={chat.title} side="right">
          <button
            type="button"
            className={`${styles.collapsedItem} ${active ? styles.active : ''}`}
            onClick={onClick}
            aria-label={chat.title}
          >
            <Icon name="message-square" size={16} />
          </button>
        </Tooltip>
      </li>
    );
  }

  const startRename = () => {
    setDraftTitle(chat.title);
    setRenaming(true);
  };

  const commitRename = async () => {
    const trimmed = draftTitle.trim();
    setRenaming(false);
    if (!trimmed || trimmed === chat.title || !onRename) return;
    await onRename(chat.id, trimmed);
  };

  const cancelRename = () => {
    setDraftTitle(chat.title);
    setRenaming(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm(`Удалить чат «${chat.title}»? Сообщения будут потеряны.`)) return;
    await onDelete(chat.id);
  };

  const handleRowClick = () => {
    if (renaming) return;
    onClick();
  };

  const handleRowKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (renaming) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const stopBubble = (e: MouseEvent) => e.stopPropagation();

  return (
    <li>
      <div
        className={`${styles.item} ${active ? styles.active : ''}`}
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={handleRowKey}
      >
        {renaming ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitRename();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelRename();
              }
            }}
            onBlur={commitRename}
            onClick={stopBubble}
            className={styles.title}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent-primary, #06b6d4)',
              borderRadius: 4,
              color: 'inherit',
              font: 'inherit',
              padding: '2px 6px',
              outline: 'none',
              minWidth: 0,
              width: '100%',
            }}
            maxLength={120}
          />
        ) : (
          <span className={styles.title}>{chat.title}</span>
        )}
        <span className={styles.meta}>
          {relativeTime(chat.updated_at)} · {chat.message_count} сообщений
        </span>
        {!renaming && (
          <span className={styles.menu} onClick={stopBubble} onKeyDown={stopBubble}>
            <Dropdown
              align="right"
              trigger={
                <span aria-label="Действия" style={{ display: 'inline-flex' }}>
                  <Icon name="chevron-down" size={14} />
                </span>
              }
            >
              <button
                type="button"
                role="menuitem"
                onClick={startRename}
                className={styles.menuItem}
              >
                <Icon name="pencil" size={14} />
                <span>Переименовать</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
              >
                <Icon name="trash" size={14} />
                <span>Удалить</span>
              </button>
            </Dropdown>
          </span>
        )}
      </div>
    </li>
  );
}

