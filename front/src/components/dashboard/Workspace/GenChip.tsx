'use client';

import { useEffect, useState } from 'react';
import styles from './GenChip.module.css';

interface GenChipProps {
  generating: boolean;
  tableCount: number;
  edgeCount: number;
}

export function GenChip({ generating, tableCount, edgeCount }: GenChipProps) {
  const [visible, setVisible] = useState(generating);
  const [closing, setClosing] = useState(false);
  const [prevGenerating, setPrevGenerating] = useState(generating);

  // Derived transitions for generating → not-generating fade-out.
  if (prevGenerating !== generating) {
    setPrevGenerating(generating);
    if (generating) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
    }
  }

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 200);
    return () => clearTimeout(t);
  }, [closing]);

  if (!visible) return null;

  return (
    <div className={`${styles.chip} ${closing ? styles.closing : ''}`} role="status" aria-live="polite">
      <span className={styles.dot} />
      <span className={styles.label}>Генерирую</span>
      <span className={styles.divider}>·</span>
      <span className={styles.stat}>
        {tableCount} {pluralTables(tableCount)} · {edgeCount} {pluralEdges(edgeCount)}
      </span>
    </div>
  );
}

function pluralTables(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'таблица';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'таблицы';
  return 'таблиц';
}

function pluralEdges(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'связь';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'связи';
  return 'связей';
}
