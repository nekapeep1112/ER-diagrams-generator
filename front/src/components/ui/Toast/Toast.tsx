import { Icon } from '../Icon';
import styles from './Toast.module.css';
import type { ToastVariant } from '@/store/toastStore';

interface ToastProps {
  variant: ToastVariant;
  message: string;
}

export function Toast({ variant, message }: ToastProps) {
  const iconName =
    variant === 'success' ? 'check-circle' : variant === 'error' ? 'circle-alert' : 'message-square';
  const iconClass =
    variant === 'success' ? styles.iconSuccess : variant === 'error' ? styles.iconError : styles.iconInfo;
  return (
    <div className={`${styles.toast} ${styles[variant]}`} role="status" aria-live="polite">
      <span className={iconClass}>
        <Icon name={iconName} size={14} />
      </span>
      <span>{message}</span>
    </div>
  );
}
