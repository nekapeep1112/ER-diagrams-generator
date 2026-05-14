'use client';

import styles from './CategoryChips.module.css';

export interface CategoryItem {
  value: string;
  label: string;
  count?: number;
}

interface CategoryChipsProps {
  items: CategoryItem[];
  active: string;
  onChange: (value: string) => void;
}

export function CategoryChips({ items, active, onChange }: CategoryChipsProps) {
  return (
    <div className={styles.row}>
      <div className={styles.scroll}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`${styles.chip} ${item.value === active ? styles.active : ''}`}
            onClick={() => onChange(item.value)}
          >
            {item.label}
            {item.count !== undefined && <span className={styles.count}>({item.count})</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
