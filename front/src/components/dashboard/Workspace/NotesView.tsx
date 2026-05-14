'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toast } from '@/store/toastStore';
import type { TableNote } from '@/types';
import { NoteCard } from '@/components/notes/NoteCard';
import styles from './NotesView.module.css';

type Filter = 'all' | 'byTable' | 'general';

interface NotesViewProps {
  notes: TableNote[];
}

export function NotesView({ notes }: NotesViewProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const byTable = notes.filter((n) => !!n.table_name).length;
    const general = notes.length - byTable;
    return { all: notes.length, byTable, general };
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (filter === 'byTable') return notes.filter((n) => !!n.table_name);
    if (filter === 'general') return notes.filter((n) => !n.table_name);
    return notes;
  }, [filter, notes]);

  if (notes.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon name="sticky-note" size={32} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Пока нет заметок</h3>
        <p className={styles.emptyHint}>
          Добавляйте заметки к таблицам или к схеме целиком, чтобы ничего не упустить
        </p>
        <Button
          variant="primary"
          size="sm"
          icon="plus"
          onClick={() => toast.info('Создание заметок появится позже')}
        >
          Добавить первую
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.view}>
      <div className={styles.filterChips}>
        <button
          type="button"
          className={`${styles.chip} ${filter === 'all' ? styles.chipActive : ''}`}
          onClick={() => setFilter('all')}
        >
          Все · {counts.all}
        </button>
        <button
          type="button"
          className={`${styles.chip} ${filter === 'byTable' ? styles.chipActive : ''}`}
          onClick={() => setFilter('byTable')}
        >
          По таблицам · {counts.byTable}
        </button>
        <button
          type="button"
          className={`${styles.chip} ${filter === 'general' ? styles.chipActive : ''}`}
          onClick={() => setFilter('general')}
        >
          General · {counts.general}
        </button>
      </div>

      <ul className={styles.list}>
        {filteredNotes.map((n) => (
          <NoteCard key={n.id} note={n} />
        ))}
      </ul>
    </div>
  );
}
