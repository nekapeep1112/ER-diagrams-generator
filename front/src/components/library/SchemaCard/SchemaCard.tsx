'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { TagPill } from '@/components/ui/TagPill';
import { MiniERPreview } from '@/components/templates/MiniERPreview';
import { relativeTime } from '@/lib/relativeTime';
import { toast } from '@/store/toastStore';
import type { SavedSchema } from '@/types';
import styles from './SchemaCard.module.css';

const MAX_VISIBLE_TAGS = 3;

interface SchemaCardProps {
  schema: SavedSchema;
  onPublish?: () => void;
  onDelete?: () => void;
  variant?: 'default' | 'list';
}

function extractDialect(sql: string): string {
  const match = sql.match(/диалект\s+(\S+)/i);
  return match ? match[1] : 'PostgreSQL';
}

export function SchemaCard({ schema, onPublish, onDelete, variant = 'default' }: SchemaCardProps) {
  const dialect = extractDialect(schema.sql);
  const tables = schema.er_data.nodes.length;
  const edges = schema.er_data.edges.length;
  const visibleTags = schema.tags.slice(0, MAX_VISIBLE_TAGS);
  const overflow = schema.tags.length - visibleTags.length;

  function handlePublishClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (onPublish) onPublish();
    else toast.info('Опубликовать через детальную страницу');
  }

  function handleDeleteClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete();
    else toast.success('Схема удалена');
  }

  const statusPill = schema.is_published ? (
    <Pill variant="info" className={styles.pubPill}>
      <span className={styles.pubDot} />
      Опубликовано · {schema.fork_count} форков
    </Pill>
  ) : (
    <Pill variant="neutral">Не опубликовано</Pill>
  );

  const isList = variant === 'list';

  return (
    <Link
      href={`/library/${schema.id}`}
      className={`${styles.card} ${isList ? styles.listCard : ''}`}
    >
      <div className={styles.thumbWrap}>
        <MiniERPreview templateId={schema.id} height={isList ? 96 : 160} />
        <div className={styles.actions}>
          <span className={styles.ibtn} aria-hidden="true">
            <Icon name="pencil" size={14} />
          </span>
          <button
            type="button"
            className={styles.ibtn}
            aria-label="Опубликовать как шаблон"
            onClick={handlePublishClick}
          >
            <Icon name="share-2" size={14} />
          </button>
          <button
            type="button"
            className={`${styles.ibtn} ${styles.ibtnDanger}`}
            aria-label="Удалить"
            onClick={handleDeleteClick}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{schema.name}</h3>
          <Badge>{dialect}</Badge>
        </div>
        <div className={styles.stats}>
          <span>{tables} таблиц</span>
          <span className={styles.sep}>·</span>
          <span>{edges} связей</span>
          <span className={styles.sep}>·</span>
          <span>{dialect}</span>
        </div>
        <div className={styles.tagsRow}>
          {visibleTags.map((tag) => (
            <TagPill key={tag.id} name={tag.name} color={tag.color} />
          ))}
          {overflow > 0 && <span className={styles.tagMore}>+{overflow}</span>}
        </div>
        <div className={styles.footerRow}>
          <span className={styles.updated}>обновлено {relativeTime(schema.updated_at)}</span>
          {statusPill}
        </div>
      </div>
    </Link>
  );
}
