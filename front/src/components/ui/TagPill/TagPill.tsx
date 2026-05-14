import type { CSSProperties } from 'react';
import { Icon } from '../Icon';
import styles from './TagPill.module.css';

interface TagPillProps {
  name: string;
  color: string;
  onRemove?: () => void;
  className?: string;
}

export function TagPill({ name, color, onRemove, className }: TagPillProps) {
  const style = { '--tag-color': color } as CSSProperties;
  return (
    <span className={[styles.pill, className ?? ''].filter(Boolean).join(' ')} style={style}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Удалить тег ${name}`}
        >
          <Icon name="x" size={11} />
        </button>
      )}
    </span>
  );
}
