'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { TagPill } from '@/components/ui/TagPill';
import { toast } from '@/store/toastStore';
import type { SchemaTemplate } from '@/types';
import { MiniERPreview } from '../MiniERPreview';
import styles from './TemplateCard.module.css';

interface TemplateCardProps {
  template: SchemaTemplate;
  inLibrary?: boolean;
  variant?: 'default' | 'list';
}

const MAX_VISIBLE_TAGS = 3;

function authorInitials(username: string): string {
  const cleaned = username.replace(/[._-]+/g, ' ').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

export function TemplateCard({ template, inLibrary, variant = 'default' }: TemplateCardProps) {
  const visibleTags = template.tags.slice(0, MAX_VISIBLE_TAGS);
  const overflow = template.tags.length - visibleTags.length;
  const forks = template.fork_count.toLocaleString('ru-RU');

  function handleBookmark(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    toast.info('Войдите чтобы сохранить шаблон');
  }

  if (variant === 'list') {
    return (
      <Link href={`/templates/${template.id}`} className={`${styles.card} ${styles.listCard} ${inLibrary ? styles.inLibrary : ''}`}>
        <div className={styles.listThumb}>
          <MiniERPreview templateId={template.id} height={60} />
        </div>
        <div className={styles.listBody}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{template.name}</h3>
            <Badge>{template.category.toUpperCase()}</Badge>
          </div>
          <p className={styles.desc}>{template.description}</p>
          <div className={styles.tagsRow}>
            {visibleTags.map((tag) => (
              <TagPill key={tag.id} name={tag.name} color={tag.color} />
            ))}
            {overflow > 0 && <span className={styles.tagMore}>+{overflow}</span>}
          </div>
        </div>
        <div className={styles.listMeta}>
          <span className={styles.author}>
            <Avatar initials={authorInitials(template.author.username)} size={16} />
            by {template.author.username}
          </span>
          <span className={styles.uses}>
            <Icon name="users" size={12} />
            {forks}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/templates/${template.id}`} className={`${styles.card} ${inLibrary ? styles.inLibrary : ''}`}>
      <div className={styles.thumbWrap}>
        <MiniERPreview templateId={template.id} height={160} />
        {inLibrary && (
          <span className={styles.libBadge}>
            <Icon name="check" size={9} />
            В библиотеке
          </span>
        )}
        <button
          type="button"
          className={styles.bookmark}
          onClick={handleBookmark}
          aria-label="Сохранить шаблон"
        >
          <Icon name="bookmark" size={14} />
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{template.name}</h3>
          <Badge>{template.category.toUpperCase()}</Badge>
        </div>
        <p className={styles.desc}>{template.description}</p>
        <div className={styles.tagsRow}>
          {visibleTags.map((tag) => (
            <TagPill key={tag.id} name={tag.name} color={tag.color} />
          ))}
          {overflow > 0 && <span className={styles.tagMore}>+{overflow}</span>}
        </div>
        <div className={styles.footerRow}>
          <span className={styles.author}>
            <Avatar initials={authorInitials(template.author.username)} size={16} />
            <span>by {template.author.username}</span>
          </span>
          <span className={styles.uses}>
            <Icon name="users" size={12} />
            {forks}
          </span>
        </div>
      </div>
    </Link>
  );
}
