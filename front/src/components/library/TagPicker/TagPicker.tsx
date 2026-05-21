'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import type { Tag } from '@/types';
import styles from './TagPicker.module.css';

interface TagPickerProps {
  allTags: Tag[];
  selectedIds: string[];
  onToggle: (tagId: string) => void | Promise<void>;
  onCreate: (name: string) => Promise<Tag | null>;
  trigger: React.ReactNode;
  disabled?: boolean;
}

export function TagPicker({
  allTags,
  selectedIds,
  onToggle,
  onCreate,
  trigger,
  disabled,
}: TagPickerProps) {
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTags, query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allTags.find((t) => t.name.toLowerCase() === q) ?? null;
  }, [allTags, query]);

  const handleCreate = async () => {
    const name = query.trim();
    if (!name || exactMatch || creating) return;
    setCreating(true);
    try {
      const created = await onCreate(name);
      if (created) setQuery('');
    } finally {
      setCreating(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  if (disabled) return <>{trigger}</>;

  return (
    <Dropdown trigger={trigger} align="left">
      <div className={styles.box} onMouseDown={(e) => e.stopPropagation()}>
        <input
          type="text"
          className={styles.search}
          placeholder="Поиск или новый тег…"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 50))}
          onKeyDown={handleKey}
          maxLength={50}
        />
        <div className={styles.list} role="listbox">
          {filtered.length === 0 && !query && (
            <div className={styles.empty}>Тегов пока нет — создайте первый</div>
          )}
          {filtered.map((tag) => {
            const selected = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`${styles.item} ${selected ? styles.itemSelected : ''}`}
                onClick={() => onToggle(tag.id)}
              >
                <span
                  className={styles.swatch}
                  style={{ background: tag.color }}
                  aria-hidden="true"
                />
                <span className={styles.name}>{tag.name}</span>
                {selected && (
                  <Icon name="check" size={12} className={styles.check} />
                )}
              </button>
            );
          })}
        </div>
        {query.trim() && !exactMatch && (
          <button
            type="button"
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={creating}
          >
            <Icon name="plus" size={12} />
            <span>
              {creating ? 'Создаю…' : `Создать «${query.trim()}»`}
            </span>
          </button>
        )}
      </div>
    </Dropdown>
  );
}
