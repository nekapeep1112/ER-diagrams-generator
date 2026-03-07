'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Link2 } from 'lucide-react';
import type { Column } from '@/types';

interface TableNodeData {
  tableName: string;
  columns: Column[];
}

interface TableNodeProps {
  data: TableNodeData;
}

function TableNode({ data }: TableNodeProps) {
  const { tableName, columns } = data;

  return (
    <div
      className="
        min-w-[200px] rounded-lg overflow-hidden
        bg-[#12121a] border border-[#1e1e2e]
        shadow-[0_0_20px_rgba(6,182,212,0.1)]
        hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]
        transition-shadow duration-300
      "
    >
      {/* Table header */}
      <div
        className="
          px-4 py-2.5
          bg-gradient-to-r from-cyan-500/20 to-purple-500/20
          border-b border-[#1e1e2e]
        "
      >
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
          {tableName}
        </h3>
      </div>

      {/* Columns */}
      <div className="divide-y divide-[#1e1e2e]">
        {columns.map((column: Column) => (
          <div
            key={column.name}
            className="relative px-4 py-2 flex items-center justify-between gap-4 group"
          >
            {/* Left handle for foreign keys */}
            {column.isForeign && (
              <Handle
                type="source"
                position={Position.Left}
                id={column.name}
                className="
                  !w-3 !h-3 !bg-cyan-400
                  !border-2 !border-[#0a0a0f]
                  hover:!bg-cyan-300
                  transition-colors
                "
              />
            )}

            {/* Column name */}
            <div className="flex items-center gap-2">
              {column.isPrimary && (
                <span title="Primary Key">
                  <Key size={12} className="text-yellow-400" />
                </span>
              )}
              {column.isForeign && (
                <span title="Foreign Key">
                  <Link2 size={12} className="text-cyan-400" />
                </span>
              )}
              <span
                className={`
                  text-sm
                  ${column.isPrimary ? 'text-yellow-400 font-medium' : ''}
                  ${column.isForeign && !column.isPrimary ? 'text-cyan-400' : ''}
                  ${!column.isPrimary && !column.isForeign ? 'text-zinc-300' : ''}
                `}
              >
                {column.name}
              </span>
            </div>

            {/* Column type */}
            <span className="text-xs text-zinc-500 font-mono">
              {column.type}
            </span>

            {/* Right handle for primary keys */}
            {column.isPrimary && (
              <Handle
                type="target"
                position={Position.Right}
                id={column.name}
                className="
                  !w-3 !h-3 !bg-yellow-400
                  !border-2 !border-[#0a0a0f]
                  hover:!bg-yellow-300
                  transition-colors
                "
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(TableNode);
