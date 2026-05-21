'use client';

import { useEffect, useMemo, type RefObject } from 'react';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Icon } from '@/components/ui/Icon';
import { TableNode } from '../TableNode';
import { useExportPng, type ExportPngFn } from '@/lib/exportDiagramPng';
import type { ERData } from '@/types';
import styles from './ReadonlyERCanvas.module.css';

const nodeTypes = { tableNode: TableNode };

export type { ExportPngFn };

interface ReadonlyERCanvasProps {
  erData: ERData;
  exportPngRef?: RefObject<ExportPngFn | null>;
}

function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <div className={styles.zoomControls}>
      <button type="button" onClick={() => zoomOut()} aria-label="Уменьшить">
        <Icon name="minus" size={14} />
      </button>
      <button type="button" onClick={() => zoomIn()} aria-label="Увеличить">
        <Icon name="plus" size={14} />
      </button>
      <button type="button" onClick={() => fitView({ padding: 0.15, duration: 200 })} aria-label="По размеру">
        <Icon name="maximize" size={14} />
      </button>
    </div>
  );
}

function CanvasInner({ erData, exportPngRef }: ReadonlyERCanvasProps) {
  const exportPng = useExportPng();
  useEffect(() => {
    if (!exportPngRef) return;
    exportPngRef.current = exportPng;
    return () => {
      exportPngRef.current = null;
    };
  }, [exportPng, exportPngRef]);

  const nodes = useMemo<Node[]>(
    () => erData.nodes.map((n) => ({ ...n }) as unknown as Node),
    [erData.nodes],
  );

  const edges = useMemo<Edge[]>(
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
        style: { stroke: '#06b6d4', strokeWidth: 1.75, strokeOpacity: 0.9 },
        labelStyle: { fill: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10 },
        labelBgStyle: { fill: 'rgba(18, 18, 26, 0.9)' },
      })),
    [erData.edges],
  );

  return (
    <div className={styles.wrap}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient
            id="er-edge-gradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="1200"
            y2="0"
          >
            <stop offset="0" stopColor="#06b6d4" stopOpacity="0.7" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} size={1.2} color="rgba(255, 255, 255, 0.06)" />
      </ReactFlow>
      <div className={styles.readChip}>
        <span className={styles.dot} />
        <span>Превью схемы · только для чтения</span>
      </div>
      <ZoomControls />
    </div>
  );
}

export function ReadonlyERCanvas(props: ReadonlyERCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
