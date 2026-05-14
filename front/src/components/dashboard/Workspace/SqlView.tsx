'use client';

import { useMemo } from 'react';
import { highlightSqlLine } from '@/lib/sql-highlight';
import type { SqlDialect } from '@/types';
import styles from './SqlView.module.css';

interface SqlViewProps {
  sql: string;
  dialect: SqlDialect;
}

export function SqlView({ sql, dialect }: SqlViewProps) {
  const lines = useMemo(() => sql.split('\n'), [sql]);

  if (!sql) {
    return (
      <div className={styles.empty}>
        <span>SQL появится после генерации схемы</span>
      </div>
    );
  }

  return (
    <div className={styles.view}>
      <div className={styles.dialectChip}>{dialect}</div>
      <pre className={styles.body}>
        {lines.map((line, i) => (
          <div key={i} className={styles.line}>
            <span className={styles.lineNum}>{i + 1}</span>
            <span className={styles.lineText}>{highlightSqlLine(line)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
