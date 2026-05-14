'use client';

import { useMemo, useState } from 'react';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Icon } from '@/components/ui/Icon';
import { TableNode } from '@/components/er-diagram/TableNode';
import type { ERData, TableNote } from '@/types';
import { GenChip } from './GenChip';
import { ZoomControls } from './ZoomControls';
import styles from './DiagramView.module.css';

const nodeTypes = { tableNode: TableNode };

interface DiagramViewProps {
  erData: ERData;
  notes: TableNote[];
  generating: boolean;
}

function CanvasInner({ erData, notes, generating }: DiagramViewProps) {
  const initialNodes = useMemo<Node[]>(() => {
    const notesByTable = new Map<string, number>();
    for (const note of notes) {
      if (!note.table_name) continue;
      notesByTable.set(note.table_name, (notesByTable.get(note.table_name) ?? 0) + 1);
    }
    return erData.nodes.map(
      (n) =>
        ({
          ...n,
          data: {
            ...n.data,
            notesCount: notesByTable.get(n.data.tableName) ?? 0,
          },
        }) as unknown as Node,
    );
  }, [erData.nodes, notes]);

  const initialEdges = useMemo<Edge[]>(
    () =>
      erData.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: 'smoothstep',
        animated: e.animated,
        label: e.label,
        style: { stroke: 'url(#dashboard-edge-gradient)', strokeWidth: 1.5 },
        labelStyle: { fill: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10 },
        labelBgStyle: { fill: 'rgba(18, 18, 26, 0.9)' },
      })),
    [erData.edges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Re-seed local state when source ER data changes (different chat / new generation).
  const [prevInitialNodes, setPrevInitialNodes] = useState(initialNodes);
  if (prevInitialNodes !== initialNodes) {
    setPrevInitialNodes(initialNodes);
    setNodes(initialNodes);
  }
  const [prevInitialEdges, setPrevInitialEdges] = useState(initialEdges);
  if (prevInitialEdges !== initialEdges) {
    setPrevInitialEdges(initialEdges);
    setEdges(initialEdges);
  }

  if (erData.nodes.length === 0) {
    return <DiagramEmpty />;
  }

  return (
    <div className={styles.canvas}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="dashboard-edge-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#06b6d4" stopOpacity="0.7" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.4}
        maxZoom={1.8}
        nodesDraggable
        nodesConnectable={false}
        edgesFocusable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={18} size={1} color="rgba(255, 255, 255, 0.04)" />
      </ReactFlow>
      <GenChip
        generating={generating}
        tableCount={erData.nodes.length}
        edgeCount={erData.edges.length}
      />
      <ZoomControls />
    </div>
  );
}

function DiagramEmpty() {
  return (
    <div className={styles.empty}>
      <Icon name="database" size={48} className={styles.emptyIcon} />
      <h2 className={styles.emptyTitle}>Опишите первую схему</h2>
      <p className={styles.emptyHint}>
        Введите описание в чате ниже — диаграмма появится здесь
      </p>
      <Icon name="arrow-down-up" size={20} className={styles.emptyArrow} />
    </div>
  );
}

export function DiagramView(props: DiagramViewProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
