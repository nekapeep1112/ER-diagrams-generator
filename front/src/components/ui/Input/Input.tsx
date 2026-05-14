import type { InputHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  icon?: IconName;
  error?: boolean;
  className?: string;
}

export function Input({ icon, error, className, ...rest }: InputProps) {
  const inputClasses = [
    styles.input,
    icon ? styles.withIcon : '',
    error ? styles.error : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      {icon && (
        <span className={styles.iconLeft}>
          <Icon name={icon} size={16} />
        </span>
      )}
      <input className={inputClasses} {...rest} />
    </div>
  );
}
