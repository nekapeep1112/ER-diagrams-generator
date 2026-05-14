'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import styles from './SortDropdown.module.css';

export type SortKey = 'popular' | 'recent' | 'name';

export interface SortOption<K extends string> {
  value: K;
  label: string;
}

interface SortDropdownProps<K extends string> {
  value: K;
  onChange: (value: K) => void;
  options: SortOption<K>[];
}

export function SortDropdown<K extends string>({ value, onChange, options }: SortDropdownProps<K>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon name="arrow-down-up" size={14} />
        <span>{current.label}</span>
        <Icon name="chevron-down" size={12} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.item} ${opt.value === value ? styles.active : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              role="menuitem"
            >
              <span className={styles.dot} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
