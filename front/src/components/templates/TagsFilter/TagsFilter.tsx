'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { Tag } from '@/types';
import styles from './TagsFilter.module.css';

interface TagsFilterProps {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
  counts: Record<string, number>;
}

export function TagsFilter({ allTags, selectedIds, onChange, counts }: TagsFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTags, query]);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon name="tag" size={14} />
        <span>Теги</span>
        {selectedIds.length > 0 && <span className={styles.badge}>{selectedIds.length}</span>}
        <Icon name="chevron-down" size={12} />
      </button>
      {open && (
        <div className={styles.popover} role="dialog">
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Поиск тегов..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.list}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>Ничего не найдено</div>
            ) : (
              filtered.map((tag) => {
                const isSelected = selectedIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`${styles.row} ${isSelected ? styles.selected : ''}`}
                    onClick={() => toggle(tag.id)}
                  >
                    <span className={styles.cb}>
                      {isSelected && <Icon name="check" size={10} />}
                    </span>
                    <span className={styles.dot} style={{ background: tag.color }} />
                    <span className={styles.name}>{tag.name}</span>
                    <span className={styles.count}>{counts[tag.id] ?? 0}</span>
                  </button>
                );
              })
            )}
          </div>
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              disabled={selectedIds.length === 0}
            >
              Сбросить
            </Button>
            <span className={styles.summary}>{selectedIds.length > 0 ? `Выбрано ${selectedIds.length}` : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}
