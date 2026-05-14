import styles from './Tabs.module.css';

export interface TabItem<V extends string = string> {
  label: string;
  value: V;
  badge?: number | string;
}

interface TabsProps<V extends string = string> {
  tabs: TabItem<V>[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
}

export function Tabs<V extends string = string>({ tabs, value, onChange, className }: TabsProps<V>) {
  return (
    <div className={[styles.bar, className ?? ''].filter(Boolean).join(' ')} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={t.value === value}
          className={`${styles.tab} ${t.value === value ? styles.active : ''}`}
          onClick={() => onChange(t.value)}
        >
          <span className={styles.label}>{t.label}</span>
          {t.badge !== undefined && t.badge !== '' && t.badge !== 0 && (
            <span className={styles.badge}>{t.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
