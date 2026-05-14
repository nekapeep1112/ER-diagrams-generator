'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import type { Message } from '@/types';
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
}

const MONO_TOKEN_RE = /`([^`\n]+)`/g;

function renderContent(text: string): ReactNode {
  if (!text) return null;
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(MONO_TOKEN_RE.source, 'g');
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <code key={`${match.index}`} className={styles.mono}>
        {match[1]}
      </code>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 0 ? text : parts;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isLoading = !isUser && !message.content;

  return (
    <div className={styles.message}>
      <div className={`${styles.role} ${isUser ? styles.roleUser : styles.roleAi}`}>
        {isUser ? 'ВЫ' : 'ИИ'}
      </div>
      <div className={styles.body}>
        {isLoading ? (
          <div className={styles.loadingDots} aria-label="ИИ печатает">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <p className={styles.text}>{renderContent(message.content)}</p>
        )}
        {message.er_data && !isLoading && (
          <div className={styles.appliedRow}>
            <Pill variant="success">
              <Icon name="check" size={12} /> Применено к схеме
            </Pill>
          </div>
        )}
      </div>
    </div>
  );
}
