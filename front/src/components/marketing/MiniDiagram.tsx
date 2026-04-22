'use client';

import { useEffect, useState } from 'react';

export interface MiniColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export interface MiniNode {
  id: string;
  position: { x: number; y: number };
  delay?: number;
  data: {
    tableName: string;
    columns: MiniColumn[];
  };
}

export interface MiniEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  label?: string;
}

export interface MiniData {
  nodes: MiniNode[];
  edges: MiniEdge[];
}

function Col({ col }: { col: MiniColumn }) {
  const tone = col.isPrimary
    ? 'rgb(245 197 24)'
    : col.isForeign
    ? 'var(--accent-cyan)'
    : 'var(--fg-dim)';

  return (
    <div
      data-col={col.name}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        padding: '7px 12px',
        borderTop: '1px solid var(--card-border)',
        fontSize: 11.5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {col.isPrimary && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(245 197 24)" strokeWidth="2.4">
            <circle cx="8" cy="15" r="4" />
            <path d="M10.85 12.15 19 4M18 5l2 2M15 8l2 2" strokeLinecap="round" />
          </svg>
        )}
        {col.isForeign && !col.isPrimary && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M9 17H7A5 5 0 0 1 7 7h2" />
            <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
            <path d="M8 12h8" />
          </svg>
        )}
        <span style={{ color: tone, fontWeight: col.isPrimary ? 600 : 400 }}>{col.name}</span>
      </div>
      <span className="mono" style={{ color: 'var(--fg-mute)', fontSize: 10.5, letterSpacing: -0.2 }}>
        {col.type}
      </span>
    </div>
  );
}

function Table({ node, pulseTs }: { node: MiniNode; pulseTs?: number }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (!pulseTs) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 900);
    return () => clearTimeout(t);
  }, [pulseTs]);

  return (
    <div
      data-table={node.id}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: 210,
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: pulse
          ? '0 0 0 1px color-mix(in oklch, var(--accent-cyan) 60%, transparent), 0 0 30px -4px var(--accent-cyan)'
          : '0 12px 32px -16px rgba(0,0,0,0.8), 0 0 20px -12px var(--accent-cyan)',
        transition: 'box-shadow 400ms ease',
        animation: `mkt-fade-in-up 400ms ${node.delay || 0}ms backwards ease-out`,
      }}
    >
      <div
        style={{
          padding: '9px 12px',
          background:
            'linear-gradient(90deg, color-mix(in oklch, var(--accent-cyan) 18%, transparent), color-mix(in oklch, var(--accent-purple) 18%, transparent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {node.data.tableName}
        </span>
        <span className="mono" style={{ fontSize: 9.5, color: 'var(--fg-mute)' }}>
          {node.data.columns.length} cols
        </span>
      </div>
      {node.data.columns.map((c) => (
        <Col key={c.name} col={c} />
      ))}
    </div>
  );
}

function anchorFor(node: MiniNode, colName: string, side: 'left' | 'right') {
  const colIdx = node.data.columns.findIndex((c) => c.name === colName);
  const headerH = 34;
  const rowH = 28;
  const y = node.position.y + headerH + colIdx * rowH + rowH / 2;
  const x = side === 'right' ? node.position.x + 210 : node.position.x;
  return { x, y };
}

function Edge({
  from,
  to,
  label,
  color,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  color?: string;
}) {
  const dx = to.x - from.x;
  const midX = from.x + dx / 2;
  const path = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  const labelX = (from.x + to.x) / 2;
  const labelY = (from.y + to.y) / 2;

  return (
    <g>
      <path
        d={path}
        stroke={color || 'var(--accent-cyan)'}
        strokeWidth="1.6"
        fill="none"
        strokeDasharray="5 4"
        style={{ animation: 'mkt-dash 800ms linear infinite' }}
      />
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect x="-14" y="-8" width="28" height="16" rx="3" fill="var(--background)" stroke="var(--card-border)" />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="9.5"
            fill="var(--accent-cyan)"
            fontWeight="600"
          >
            {label}
          </text>
        </g>
      )}
      <circle cx={from.x} cy={from.y} r="3" fill="var(--accent-cyan)" stroke="var(--background)" strokeWidth="1.5" />
      <circle cx={to.x} cy={to.y} r="3" fill="rgb(245 197 24)" stroke="var(--background)" strokeWidth="1.5" />
    </g>
  );
}

interface MiniDiagramProps {
  data: MiniData;
  width?: number;
  height?: number;
  pulse?: number;
}

export default function MiniDiagram({ data, width = 720, height = 420, pulse }: MiniDiagramProps) {
  const nodes = data.nodes;
  type RenderedEdge = { id: string; from: { x: number; y: number }; to: { x: number; y: number }; label?: string };
  const edges: RenderedEdge[] = [];
  for (const e of data.edges) {
    const sNode = nodes.find((n) => n.id === e.source);
    const tNode = nodes.find((n) => n.id === e.target);
    if (!sNode || !tNode) continue;
    const sideFrom: 'left' | 'right' = sNode.position.x < tNode.position.x ? 'right' : 'left';
    const sideTo: 'left' | 'right' = sNode.position.x < tNode.position.x ? 'left' : 'right';
    edges.push({
      id: e.id,
      from: anchorFor(sNode, e.sourceHandle, sideFrom),
      to: anchorFor(tNode, e.targetHandle, sideTo),
      label: e.label,
    });
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {edges.map((e) => (
          <Edge key={e.id} from={e.from} to={e.to} label={e.label} />
        ))}
      </svg>
      {nodes.map((n) => (
        <Table key={n.id} node={n} pulseTs={pulse} />
      ))}
    </div>
  );
}
