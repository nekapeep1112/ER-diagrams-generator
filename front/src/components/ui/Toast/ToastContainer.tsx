'use client';

import { useToastStore } from '@/store/toastStore';
import { Toast } from './Toast';
import styles from './Toast.module.css';

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} message={t.message} />
      ))}
    </div>
  );
}
