import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function Checkbox({ checked, onChange, children, className }: CheckboxProps) {
  return (
    <label className={[styles.row, className ?? ''].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        className={styles.nativeInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.box} aria-hidden="true">
        {checked && <Icon name="check" size={12} strokeWidth={3} />}
      </span>
      <span className={styles.label}>{children}</span>
    </label>
  );
}
