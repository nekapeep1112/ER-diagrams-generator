'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Message, SqlDialect } from '@/types';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import styles from './ChatDock.module.css';

interface ChatDockProps {
  messages: Message[];
  dockHeight: number;
  onDockHeightChange: (h: number) => void;
  onSendMessage: (text: string) => void;
  dialect: SqlDialect;
}

const MIN_HEIGHT = 140;
const DEFAULT_HEIGHT = 200;

function getMaxHeight(): number {
  if (typeof window === 'undefined') return 600;
  return Math.floor(window.innerHeight * 0.5);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ChatDock({
  messages,
  dockHeight,
  onDockHeightChange,
  onSendMessage,
  dialect,
}: ChatDockProps) {
  const resizingRef = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      resizingRef.current = true;
      startY.current = e.clientY;
      startHeight.current = dockHeight;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    },
    [dockHeight],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = startY.current - e.clientY;
      const next = clamp(startHeight.current + delta, MIN_HEIGHT, getMaxHeight());
      onDockHeightChange(next);
    };
    const onMouseUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onDockHeightChange]);

  const onDoubleClick = useCallback(() => {
    const max = getMaxHeight();
    const next = dockHeight > DEFAULT_HEIGHT + 20 ? DEFAULT_HEIGHT : max;
    onDockHeightChange(next);
  }, [dockHeight, onDockHeightChange]);

  const header =
    messages.length > 0
      ? `Чат · ${messages.length} ${pluralMessages(messages.length)}`
      : 'Опишите первую схему';

  return (
    <div className={styles.dock} style={{ height: dockHeight }}>
      <div
        className={styles.handle}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        role="separator"
        aria-label="Изменить высоту чата"
        aria-orientation="horizontal"
      >
        <div className={styles.handleBar} />
      </div>
      <div className={styles.header}>{header}</div>
      <MessageList messages={messages} />
      <ChatInput onSend={onSendMessage} dialect={dialect} />
    </div>
  );
}

function pluralMessages(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'сообщение';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'сообщения';
  return 'сообщений';
}
