'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { DashboardTab, ERData, Message, SqlDialect, TableNote } from '@/types';
import { ChatDock } from '@/components/dashboard/ChatDock';
import { DiagramView } from './DiagramView';
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

  const hasUnsavedChanges = erData.nodes.length > 0;

  let content: ReactNode = null;
  if (activeTab === 'diagram') {
    content = <DiagramView erData={erData} notes={notes} generating={generating} />;
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
