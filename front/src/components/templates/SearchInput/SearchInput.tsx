'use client';

import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Поиск шаблонов...' }: SearchInputProps) {
  return (
    <div className={styles.wrapper}>
      <Input
        icon="search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => onChange('')}
          aria-label="Очистить поиск"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}
