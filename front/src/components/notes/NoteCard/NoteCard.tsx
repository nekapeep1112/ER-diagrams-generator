'use client';

import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { relativeTime } from '@/lib/relativeTime';
import { toast } from '@/store/toastStore';
import type { TableNote } from '@/types';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  note: TableNote;
  onEdit?: (note: TableNote) => void;
  onDelete?: (note: TableNote) => void | Promise<void>;
}

const TYPE_TO_VARIANT = {
  info: 'info',
  warning: 'warning',
  idea: 'purple',
  todo: 'success',
} as const;

const TYPE_LABEL = {
  info: 'Info',
  warning: 'Warning',
  idea: 'Idea',
  todo: 'TODO',
} as const;

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const variant = TYPE_TO_VARIANT[note.type];

  const handleEdit = () => {
    if (onEdit) onEdit(note);
    else toast.info('Редактирование появится позже');
  };

  const handleDelete = () => {
    if (!onDelete) {
      toast.info('Удаление появится позже');
      return;
    }
    if (!window.confirm('Удалить заметку?')) return;
    void onDelete(note);
  };

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <Pill variant={variant}>{TYPE_LABEL[note.type]}</Pill>
        {note.table_name ? (
          <span className={styles.tableRef}>
            На таблице: <code className={styles.code}>{note.table_name}</code>
          </span>
        ) : (
          <span className={styles.tableRef}>General</span>
        )}
      </div>
      <p className={styles.body}>{note.body}</p>
      <div className={styles.footer}>
        <span className={styles.time}>{relativeTime(note.created_at)}</span>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Редактировать"
            onClick={handleEdit}
          >
            <Icon name="pencil" size={14} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Удалить"
            onClick={handleDelete}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>
    </li>
  );
}
