'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuthStore } from '@/store/authStore';
import { isPro as checkIsPro } from '@/lib/user-helpers';
import { toast } from '@/store/toastStore';
import type { DashboardTab, SqlDialect } from '@/types';
import styles from './TabBar.module.css';

const DIALECTS: SqlDialect[] = ['PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'Oracle'];

interface TabBarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  notesCount: number;
  hasUnsavedChanges: boolean;
  dialect: SqlDialect;
  onDialectChange: (d: SqlDialect) => void;
  sql: string;
  onSave?: () => void;
  saving?: boolean;
  onExportPng?: () => Promise<void> | void;
  canExportPng?: boolean;
}

export function TabBar({
  activeTab,
  onTabChange,
  notesCount,
  hasUnsavedChanges,
  dialect,
  onDialectChange,
  sql,
  onSave,
  saving,
  onExportPng,
  canExportPng,
}: TabBarProps) {
  return (
    <div className={styles.tabBar}>
      <Tabs<DashboardTab>
        tabs={[
          { value: 'diagram', label: 'Диаграмма' },
          { value: 'sql', label: 'SQL' },
          { value: 'notes', label: 'Заметки', badge: notesCount > 0 ? notesCount : undefined },
        ]}
        value={activeTab}
        onChange={onTabChange}
        className={styles.tabs}
      />

      <div className={styles.actions}>
        {activeTab === 'diagram' && (
          <DiagramActions
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={onSave}
            saving={saving}
            onExportPng={onExportPng}
            canExportPng={canExportPng}
          />
        )}
        {activeTab === 'sql' && (
          <SqlActions dialect={dialect} onDialectChange={onDialectChange} sql={sql} />
        )}
        {activeTab === 'notes' && <NotesActions />}
      </div>
    </div>
  );
}

function DiagramActions({
  hasUnsavedChanges,
  onSave,
  saving,
  onExportPng,
  canExportPng,
}: {
  hasUnsavedChanges: boolean;
  onSave?: () => void;
  saving?: boolean;
  onExportPng?: () => Promise<void> | void;
  canExportPng?: boolean;
}) {
  const [exporting, setExporting] = useState(false);

  const handleSave = () => {
    if (!onSave) {
      toast.info('Сохранение появится позже');
      return;
    }
    onSave();
  };

  const handleExport = async () => {
    if (!onExportPng || exporting) return;
    setExporting(true);
    try {
      await onExportPng();
    } finally {
      setExporting(false);
    }
  };

  const exportBtn = canExportPng ? (
    <Button
      variant="ghost-sm"
      icon="image"
      loading={exporting}
      disabled={exporting}
      onClick={handleExport}
    >
      Экспорт PNG
    </Button>
  ) : null;

  if (hasUnsavedChanges) {
    return (
      <>
        <Button
          variant="primary"
          size="sm"
          icon="check"
          loading={saving}
          disabled={saving}
          onClick={handleSave}
        >
          Сохранить
        </Button>
        {exportBtn}
      </>
    );
  }
  return <>{exportBtn}</>;
}

function SqlActions({
  dialect,
  onDialectChange,
  sql,
}: {
  dialect: SqlDialect;
  onDialectChange: (d: SqlDialect) => void;
  sql: string;
}) {
  const user = useAuthStore((s) => s.user);
  const isPro = checkIsPro(user);

  const handleCopy = async () => {
    if (!sql) {
      toast.info('SQL пока пуст');
      return;
    }
    try {
      await navigator.clipboard.writeText(sql);
      toast.success('SQL скопирован');
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  const handleDownload = () => {
    if (!isPro) {
      toast.info('Скачивание .sql доступно в Pro');
      return;
    }
    toast.info('Скачивание появится позже');
  };

  return (
    <>
      <Dropdown
        align="right"
        trigger={
          <button type="button" className={styles.dialectTrigger}>
            <span>{dialect}</span>
            <Icon name="chevron-down" size={12} />
          </button>
        }
      >
        {DIALECTS.map((d) => (
          <button
            key={d}
            type="button"
            className={`${styles.dialectItem} ${d === dialect ? styles.dialectItemActive : ''}`}
            onClick={() => onDialectChange(d)}
          >
            {d}
          </button>
        ))}
      </Dropdown>
      <Tooltip content="Скопировать SQL" side="bottom">
        <Button variant="ghost-sm" icon="copy" onClick={handleCopy} aria-label="Копировать SQL">
          {null}
        </Button>
      </Tooltip>
      {isPro ? (
        <Button variant="ghost-sm" icon="download" onClick={handleDownload}>
          Скачать .sql
        </Button>
      ) : (
        <Tooltip content="Доступно в Pro" side="bottom">
          <Button variant="ghost-sm" icon="lock" onClick={handleDownload}>
            Скачать .sql
          </Button>
        </Tooltip>
      )}
    </>
  );
}

function NotesActions() {
  return (
    <Button
      variant="primary"
      size="sm"
      icon="plus"
      onClick={() => toast.info('Создание заметок появится позже')}
    >
      Заметка
    </Button>
  );
}
