import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Icon } from '@/components/ui/Icon';
import type { TableNodeData } from '@/types';
import styles from './TableNode.module.css';

// xyflow's Node<NodeData> requires NodeData extends Record<string, unknown>.
// Wrap our domain type with an index signature so it satisfies that constraint
// without polluting the shared TableNodeData.
type TableNodeXyData = TableNodeData & Record<string, unknown>;
export type TableNodeType = Node<TableNodeXyData, 'tableNode'>;

function TableNodeImpl({ data, selected }: NodeProps<TableNodeType>) {
  const notesCount = typeof data.notesCount === 'number' ? data.notesCount : 0;
  return (
    <div className={`${styles.node} ${selected ? styles.selected : ''}`}>
      {notesCount > 0 && (
        <div className={styles.notesBadge}>
          <Icon name="message-square" size={12} />
          <span>{notesCount}</span>
        </div>
      )}
      <div className={styles.head}>{data.tableName}</div>
      <div className={styles.cols}>
        {data.columns.map((col) => (
          <div key={col.name} className={styles.row}>
            <span className={styles.left}>
              <span className={styles.ic}>
                {col.isPrimary ? (
                  <Icon name="key" size={12} className={styles.icPk} />
                ) : col.isForeign ? (
                  <Icon name="link-2" size={12} className={styles.icFk} />
                ) : null}
              </span>
              <span className={styles.cn}>{col.name}</span>
            </span>
            <span className={styles.type}>{col.type}</span>
            {col.isPrimary && (
              <Handle
                type="target"
                position={Position.Left}
                id={col.name}
                className={styles.handle}
                isConnectable={false}
              />
            )}
            {col.isForeign && (
              <Handle
                type="source"
                position={Position.Right}
                id={col.name}
                className={styles.handle}
                isConnectable={false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const TableNode = memo(TableNodeImpl);
