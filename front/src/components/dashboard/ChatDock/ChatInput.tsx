'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { SqlDialect } from '@/types';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  dialect: SqlDialect;
}

const MAX_HEIGHT = 96;

export function ChatInput({ onSend, dialect }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = value.trim().length > 0;

  return (
    <form className={styles.inputBar} onSubmit={handleSubmit}>
      <div className={styles.inputShell}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Опишите изменение схемы…"
          rows={1}
          className={styles.input}
        />
        <div className={styles.row}>
          <button type="button" className={styles.dialect}>
            <span>{dialect}</span>
            <Icon name="chevron-down" size={12} />
          </button>
          <button
            type="submit"
            className={styles.send}
            disabled={!canSend}
            aria-label="Отправить"
          >
            <Icon name="arrow-up" size={16} />
          </button>
        </div>
      </div>
      <div className={styles.hints}>
        <span className="micro">⌘ ↵ для отправки</span>
        <span className="micro">⇧ ↵ для переноса</span>
      </div>
    </form>
  );
}
