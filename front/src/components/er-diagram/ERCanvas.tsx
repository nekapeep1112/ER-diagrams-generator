'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';

import TableNode from './TableNode';
import type { ERData } from '@/types';
import { schemasApi } from '@/lib/api';
import { User, LogOut, PanelLeft, Key, Link2, FileDown, BookmarkPlus, Check, X } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, React.ComponentType<any>> = {
  tableNode: TableNode,
};

interface ERCanvasProps {
  erData: ERData | null;
  currentSql?: string | null;
  user?: { username: string } | null;
  onLogout?: () => void;
  isSidebarVisible?: boolean;
  onOpenSidebar?: () => void;
}

function ERCanvasInner({ erData, currentSql, user, onLogout, isSidebarVisible, onOpenSidebar }: ERCanvasProps) {
  const reactFlowInstance = useReactFlow();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Save to library state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSaveToLibrary = async () => {
    if (!erData || !saveName.trim()) return;
    setSaveStatus('loading');
    try {
      await schemasApi.create({
        name: saveName.trim(),
        er_data: erData,
        sql: currentSql ?? '',
      });
      setSaveStatus('success');
      setTimeout(() => {
        setShowSaveDialog(false);
        setSaveName('');
        setSaveStatus('idle');
      }, 1200);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const openSaveDialog = () => {
    setSaveName('');
    setSaveStatus('idle');
    setShowSaveDialog(true);
  };

  const handleSaveToPDF = useCallback(async () => {
    if (!reactFlowInstance) return;

    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    try {
      const nodes = reactFlowInstance.getNodes();
      if (nodes.length === 0) return;

      // Fit view to show all nodes with padding
      reactFlowInstance.fitView({
        padding: 0.3,
        duration: 0,
      });

      // Wait for the view to update
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get the current dimensions of the flow element
      const rect = flowElement.getBoundingClientRect();

      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#0a0a0f',
        width: rect.width,
        height: rect.height,
        pixelRatio: 2,
      });

      // Download
      const link = document.createElement('a');
      link.download = 'er-diagram.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  }, [reactFlowInstance]);

  // Update nodes/edges when erData changes
  useEffect(() => {
    if (!erData) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Convert ER nodes to React Flow nodes
    const flowNodes = erData.nodes.map((node) => ({
      id: node.id,
      type: 'tableNode',
      position: node.position,
      data: node.data,
    }));

    // Convert ER edges to React Flow edges
    const flowEdges = erData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'smoothstep',
      animated: true,
      label: edge.label,
      style: {
        stroke: '#06b6d4',
        strokeWidth: 2,
      },
      labelStyle: {
        fill: '#06b6d4',
        fontWeight: 600,
        fontSize: 10,
      },
      labelBgStyle: {
        fill: '#0a0a0f',
        fillOpacity: 0.8,
      },
      labelBgPadding: [4, 4] as [number, number],
      labelBgBorderRadius: 4,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [erData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEdges((eds: any) =>
        addEdge(
          {
            ...params,
            id: `edge-${Date.now()}`,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#06b6d4', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  if (!erData || erData.nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0f] relative">
        {/* Open sidebar button */}
        {!isSidebarVisible && (
          <button
            onClick={onOpenSidebar}
            className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-[#12121a]/90 backdrop-blur border border-[#1e1e2e] text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
            title="Открыть панель чата"
          >
            <PanelLeft size={18} />
          </button>
        )}

        {/* User profile button */}
        {user && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center hover:bg-purple-500/30 transition-colors"
            >
              <User size={16} className="text-purple-400" />
            </button>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  ref={menuRef}
                  className="absolute top-full right-0 mt-2 z-20 bg-[#1a1a2e] border border-[#1e1e2e] rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
                  >
                    <LogOut size={16} />
                    Выйти
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <div className="text-center max-w-md">
          <div
            className="
              w-24 h-24 mx-auto mb-6 rounded-2xl
              bg-gradient-to-r from-cyan-500/10 to-purple-500/10
              border border-[#1e1e2e]
              flex items-center justify-center
            "
          >
            <svg
              className="w-12 h-12 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Рабочая область пуста
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Отправьте запрос в чате для генерации ER-диаграммы.
            <br />
            Например: &quot;Создай базу данных для интернет-магазина&quot;
          </p>
        </div>

        {/* Legend */}
        <div
          className="
            absolute bottom-4 left-1/2 -translate-x-1/2 z-10
            flex items-center gap-6 px-4 py-2
            bg-[#12121a]/90 backdrop-blur border border-[#1e1e2e] rounded-lg
          "
        >
          <div className="flex items-center gap-2">
            <Key size={14} className="text-yellow-400" />
            <span className="text-xs text-zinc-400">Primary Key</span>
          </div>
          <div className="flex items-center gap-2">
            <Link2 size={14} className="text-cyan-400" />
            <span className="text-xs text-zinc-400">Foreign Key</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0f] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1e1e2e"
          gap={20}
          size={1}
        />
      </ReactFlow>

      {/* Open sidebar button */}
      {!isSidebarVisible && (
        <button
          onClick={onOpenSidebar}
          className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-[#12121a]/90 backdrop-blur border border-[#1e1e2e] text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
          title="Открыть панель чата"
        >
          <PanelLeft size={18} />
        </button>
      )}

      {/* Save to library dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-80 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium text-sm">Сохранить в библиотеку</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveToLibrary()}
              placeholder="Название схемы..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors mb-3"
            />
            {saveStatus === 'error' && (
              <p className="text-red-400 text-xs mb-3">Ошибка сохранения. Попробуй ещё раз.</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveToLibrary}
                disabled={!saveName.trim() || saveStatus === 'loading'}
                className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {saveStatus === 'success' ? (
                  <><Check size={14} /> Сохранено</>
                ) : saveStatus === 'loading' ? (
                  'Сохранение...'
                ) : (
                  'Сохранить'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User profile button */}
      {user && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={openSaveDialog}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm"
            title="Сохранить в библиотеку"
          >
            <BookmarkPlus size={16} />
            <span className="hidden sm:inline">В библиотеку</span>
          </button>
          <button
            onClick={handleSaveToPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm"
            title="Скачать PNG"
          >
            <FileDown size={16} />
            <span className="hidden sm:inline">Скачать PNG</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center hover:bg-purple-500/30 transition-colors"
            >
              <User size={16} className="text-purple-400" />
            </button>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  ref={menuRef}
                  className="absolute top-full right-0 mt-2 z-20 bg-[#1a1a2e] border border-[#1e1e2e] rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
                  >
                    <LogOut size={16} />
                    Выйти
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="
          absolute bottom-4 left-1/2 -translate-x-1/2 z-10
          flex items-center gap-6 px-4 py-2
          bg-[#12121a]/90 backdrop-blur border border-[#1e1e2e] rounded-lg
        "
      >
        <div className="flex items-center gap-2">
          <Key size={14} className="text-yellow-400" />
          <span className="text-xs text-zinc-400">Primary Key</span>
        </div>
        <div className="flex items-center gap-2">
          <Link2 size={14} className="text-cyan-400" />
          <span className="text-xs text-zinc-400">Foreign Key</span>
        </div>
      </div>
    </div>
  );
}

export default function ERCanvas(props: ERCanvasProps) {
  return (
    <ReactFlowProvider>
      <ERCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
