'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import type { NoteType } from '@/lib/api/notes';
import type { TableNote } from '@/types';
import styles from './NoteEditor.module.css';

interface NoteEditorProps {
  open: boolean;
  onClose: () => void;
  /** Если передано — режим редактирования; иначе — создание. */
  note?: TableNote | null;
  /** Список таблиц схемы, чтобы предложить привязку. */
  tableNames: string[];
  onSubmit: (payload: { type: NoteType; table_name?: string; body: string }) => Promise<void>;
}

const TYPES: { value: NoteType; label: string }[] = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'idea', label: 'Idea' },
  { value: 'todo', label: 'TODO' },
];

const GENERAL_VALUE = '__general__';

export function NoteEditor({ open, onClose, note, tableNames, onSubmit }: NoteEditorProps) {
  const isEdit = !!note;

  const [type, setType] = useState<NoteType>(note?.type ?? 'info');
  const [tableName, setTableName] = useState<string>(note?.table_name ?? '');
  const [body, setBody] = useState<string>(note?.body ?? '');
  const [submitting, setSubmitting] = useState(false);

  // Сброс формы при открытии/смене редактируемой заметки
  useEffect(() => {
    if (!open) return;
    setType(note?.type ?? 'info');
    setTableName(note?.table_name ?? '');
    setBody(note?.body ?? '');
    setSubmitting(false);
  }, [open, note]);

  const tableOptions = useMemo(() => {
    return [...new Set(tableNames)].sort((a, b) => a.localeCompare(b));
  }, [tableNames]);

  const canSubmit = body.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        table_name: tableName || undefined,
        body: body.trim(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const header = (
    <div className={styles.header}>
      <h3 className={styles.title}>
        <span className={styles.iconBadge}>
          <Icon name="sticky-note" size={14} />
        </span>
        {isEdit ? 'Редактировать заметку' : 'Новая заметка'}
      </h3>
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
        <Icon name="x" size={16} />
      </button>
    </div>
  );

  const footer = (
    <div className={styles.footer}>
      <Button variant="ghost" onClick={onClose} disabled={submitting}>
        Отмена
      </Button>
      <Button
        variant="primary"
        icon="check"
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={submitting}
      >
        {isEdit ? 'Сохранить' : 'Создать'}
      </Button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Редактор заметки" header={header} footer={footer}>
      <div className={styles.body}>
        <div className={styles.field}>
          <label className={styles.label}>Тип</label>
          <div className={styles.typeRow}>
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`${styles.typeChip} ${type === t.value ? styles.typeChipActive : ''} ${styles[`type_${t.value}`]}`}
                onClick={() => setType(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Привязка</label>
          <select
            className={styles.select}
            value={tableName || GENERAL_VALUE}
            onChange={(e) =>
              setTableName(e.target.value === GENERAL_VALUE ? '' : e.target.value)
            }
          >
            <option value={GENERAL_VALUE}>General (вся схема)</option>
            {tableOptions.map((name) => (
              <option key={name} value={name}>
                Таблица: {name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Текст</label>
            <span className={styles.counter}>{body.length} / 2000</span>
          </div>
          <textarea
            className={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 2000))}
            placeholder="Что важно не забыть про эту таблицу или схему?"
            rows={6}
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
}
