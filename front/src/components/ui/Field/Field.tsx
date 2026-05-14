import type { ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label: ReactNode;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className }: FieldProps) {
  return (
    <div className={[styles.field, className ?? ''].filter(Boolean).join(' ')}>
      <label className={`${styles.label} micro`}>{label}</label>
      {children}
      {hint && !error && <div className={styles.hint}>{hint}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
