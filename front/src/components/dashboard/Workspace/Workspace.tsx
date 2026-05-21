'use client';

import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { DashboardTab, ERData, Message, SqlDialect, TableNote } from '@/types';
import { ChatDock } from '@/components/dashboard/ChatDock';
import { toast } from '@/store/toastStore';
import { DiagramView, type ExportPngFn } from './DiagramView';
import { NotesView } from './NotesView';
import { SqlView } from './SqlView';
import { TabBar } from './TabBar';
import styles from './Workspace.module.css';

interface WorkspaceProps {
  erData: ERData;
  sql: string;
  notes: TableNote[];
  messages: Message[];
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  generating: boolean;
  dockHeight: number;
  onDockHeightChange: (h: number) => void;
  onSendMessage: (text: string) => void;
  onSave?: (dialect: SqlDialect) => void;
  saving?: boolean;
}

export function Workspace({
  erData,
  sql,
  notes,
  messages,
  activeTab,
  onTabChange,
  generating,
  dockHeight,
  onDockHeightChange,
  onSendMessage,
  onSave,
  saving,
}: WorkspaceProps) {
  const [dialect, setDialect] = useState<SqlDialect>('PostgreSQL');
  const exportPngRef = useRef<ExportPngFn | null>(null);

  const hasUnsavedChanges = erData.nodes.length > 0;

  const handleExportPng = useCallback(async () => {
    if (!exportPngRef.current) {
      toast.info('Нечего экспортировать');
      return;
    }
    try {
      await exportPngRef.current('er-diagram');
      toast.success('PNG сохранён');
    } catch {
      toast.error('Не удалось экспортировать PNG');
    }
  }, []);

  let content: ReactNode = null;
  if (activeTab === 'diagram') {
    content = (
      <DiagramView
        erData={erData}
        notes={notes}
        generating={generating}
        exportPngRef={exportPngRef}
      />
    );
  } else if (activeTab === 'sql') {
    content = <SqlView sql={sql} dialect={dialect} />;
  } else if (activeTab === 'notes') {
    content = <NotesView notes={notes} />;
  }

  return (
    <div className={styles.workspace}>
      <TabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        notesCount={notes.length}
        hasUnsavedChanges={hasUnsavedChanges}
        dialect={dialect}
        onDialectChange={setDialect}
        sql={sql}
        onSave={onSave ? () => onSave(dialect) : undefined}
        saving={saving}
        onExportPng={handleExportPng}
        canExportPng={hasUnsavedChanges}
      />
      <div className={styles.canvasArea}>{content}</div>
      <ChatDock
        messages={messages}
        dockHeight={dockHeight}
        onDockHeightChange={onDockHeightChange}
        onSendMessage={onSendMessage}
        dialect={dialect}
      />
    </div>
  );
}
