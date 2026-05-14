import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  variant?: 'default' | 'dense';
  className?: string;
  children: ReactNode;
}

export function Card({ variant = 'default', className, children, ...rest }: CardProps) {
  const classes = [styles.card, styles[variant], className ?? ''].filter(Boolean).join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
