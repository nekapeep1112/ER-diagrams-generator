import type { ReactNode } from 'react';
import styles from './Pill.module.css';

type Variant = 'success' | 'info' | 'purple' | 'neutral' | 'warning';

interface PillProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function Pill({ variant = 'neutral', children, className }: PillProps) {
  return (
    <span className={[styles.pill, styles[variant], className ?? ''].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
