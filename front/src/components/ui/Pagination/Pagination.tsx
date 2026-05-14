'use client';

import { Icon } from '../Icon';
import styles from './Pagination.module.css';

interface PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
  onChange: (page: number) => void;
  className?: string;
}

function pageNumbers(current: number, totalPages: number): (number | 'dots')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: (number | 'dots')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) items.push('dots');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push('dots');
  items.push(totalPages);
  return items;
}

export function Pagination({ total, pageSize, currentPage, onChange, className }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);
  const pages = pageNumbers(currentPage, totalPages);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className={`${styles.pagination} ${className ?? ''}`}>
      <span className={styles.info}>Показано {from}–{to} из {total}</span>
      <div className={styles.nav}>
        <button
          type="button"
          className={`${styles.btn} ${!canPrev ? styles.disabled : ''}`}
          onClick={() => canPrev && onChange(currentPage - 1)}
          disabled={!canPrev}
          aria-label="Назад"
        >
          <Icon name="chevron-left" size={14} />
        </button>
        {pages.map((p, i) =>
          p === 'dots' ? (
            <span key={`d${i}`} className={`${styles.btn} ${styles.dots}`}>…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${styles.btn} ${p === currentPage ? styles.active : ''}`}
              onClick={() => onChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className={`${styles.btn} ${!canNext ? styles.disabled : ''}`}
          onClick={() => canNext && onChange(currentPage + 1)}
          disabled={!canNext}
          aria-label="Вперёд"
        >
          <Icon name="chevron-right" size={14} />
        </button>
      </div>
    </div>
  );
}
