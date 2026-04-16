'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trash2, FolderOpen, BookOpen, RefreshCw } from 'lucide-react';
import { schemasApi } from '@/lib/api';
import type { SavedSchema, ERData } from '@/types';

interface LibraryPanelProps {
  onLoadSchema: (erData: ERData, sql: string) => void;
}

export default function LibraryPanel({ onLoadSchema }: LibraryPanelProps) {
  const [schemas, setSchemas] = useState<SavedSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await schemasApi.list();
      setSchemas(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await schemasApi.delete(id);
      setSchemas((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw size={18} className="text-zinc-600 animate-spin" />
      </div>
    );
  }

  if (schemas.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
          <BookOpen size={20} className="text-purple-400" />
        </div>
        <p className="text-white text-sm font-medium mb-1">Библиотека пуста</p>
        <p className="text-zinc-500 text-xs leading-relaxed">
          Нажмите «В библиотеку» на диаграмме, чтобы сохранить схему
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
      {schemas.map((schema) => (
        <div
          key={schema.id}
          className="group flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#12121a] border border-[#1e1e2e] hover:border-purple-500/30 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{schema.name}</p>
            <p className="text-zinc-600 text-xs mt-0.5">{formatDate(schema.created_at)}</p>
          </div>
          <button
            onClick={() => onLoadSchema(schema.er_data, schema.sql)}
            className="shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-all"
            title="Открыть на холсте"
          >
            <FolderOpen size={15} />
          </button>
          <button
            onClick={() => handleDelete(schema.id)}
            disabled={deletingId === schema.id}
            className="shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
            title="Удалить"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
