'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Trash2, FolderOpen, BookOpen, RefreshCw, Search, Download, Lock, Plus, X, Tag as TagIcon } from 'lucide-react';
import { schemasApi, tagsApi } from '@/lib/api';
import type { SavedSchema, ERData, Tag, User } from '@/types';

interface LibraryPanelProps {
  onLoadSchema: (erData: ERData, sql: string) => void;
  user: User | null;
}

export default function LibraryPanel({ onLoadSchema, user }: LibraryPanelProps) {
  const [schemas, setSchemas] = useState<SavedSchema[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [tagMenuSchemaId, setTagMenuSchemaId] = useState<string | null>(null);

  const isPro = useMemo(() => (user?.groups ?? []).includes('pro_user'), [user]);

  const load = useCallback(async (opts?: { search?: string; tagIds?: string[] }) => {
    setIsLoading(true);
    try {
      const [schemasData, tagsData] = await Promise.all([
        schemasApi.list({
          search: opts?.search,
          tags: opts?.tagIds && opts.tagIds.length > 0 ? opts.tagIds : undefined,
        }),
        tagsApi.list(),
      ]);
      setSchemas(schemasData);
      setTags(tagsData);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // debounce поиска/фильтра
  useEffect(() => {
    const t = setTimeout(() => {
      load({ search, tagIds: Array.from(selectedTags) });
    }, 300);
    return () => clearTimeout(t);
  }, [search, selectedTags, load]);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;
    try {
      const tag = await tagsApi.create({ name });
      setTags((prev) => [...prev, tag]);
      setNewTagName('');
      setShowNewTag(false);
    } catch {
      // ignore
    }
  };

  const handleToggleSchemaTag = async (schema: SavedSchema, tagId: string) => {
    const currentIds = schema.tags.map((t) => t.id);
    const nextIds = currentIds.includes(tagId)
      ? currentIds.filter((id) => id !== tagId)
      : [...currentIds, tagId];
    try {
      const updated = await schemasApi.update(schema.id, { tag_ids: nextIds });
      setSchemas((prev) => prev.map((s) => (s.id === schema.id ? updated : s)));
    } catch {
      // ignore
    }
  };

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

  const handleExport = async (schema: SavedSchema) => {
    if (!isPro) {
      alert('Экспорт SQL доступен только в плане Pro.');
      return;
    }
    setExportingId(schema.id);
    try {
      const blob = await schemasApi.export(schema.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${schema.name || 'schema'}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Не удалось скачать файл.');
    } finally {
      setExportingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="px-3 py-2 border-b border-[#1e1e2e]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по схемам..."
            className="w-full bg-[#12121a] border border-[#1e1e2e] rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/40"
          />
        </div>
      </div>

      {/* Tags row: wrap-контейнер с тегами + фиксированная справа кнопка "+" */}
      <div className="px-3 py-2 border-b border-[#1e1e2e] flex items-start gap-2">
        <div className="flex-1 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
          {tags.length === 0 && !showNewTag && (
            <span className="text-xs text-zinc-600 px-1 py-1">Нет тегов</span>
          )}
          {tags.map((tag) => {
            const active = selectedTags.has(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  active
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                    : 'bg-[#12121a] border-[#1e1e2e] text-zinc-400 hover:text-zinc-200'
                }`}
                style={active ? { borderColor: tag.color } : undefined}
              >
                {tag.name}
              </button>
            );
          })}

          {showNewTag && (
            <form onSubmit={handleCreateTag} className="flex items-center gap-1">
              <input
                autoFocus
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Новый тег"
                className="w-24 bg-[#12121a] border border-purple-500/40 rounded-full px-2.5 py-1 text-xs text-white focus:outline-none"
              />
              <button type="submit" className="text-xs text-purple-400 hover:text-purple-300">OK</button>
              <button
                type="button"
                onClick={() => { setShowNewTag(false); setNewTagName(''); }}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X size={12} />
              </button>
            </form>
          )}
        </div>

        {!showNewTag && (
          <button
            onClick={() => setShowNewTag(true)}
            className="shrink-0 p-1.5 rounded-full text-zinc-400 hover:text-purple-400 bg-[#12121a] border border-[#1e1e2e] hover:border-purple-500/40"
            title="Добавить тег"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw size={18} className="text-zinc-600 animate-spin" />
        </div>
      ) : schemas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
            <BookOpen size={20} className="text-purple-400" />
          </div>
          <p className="text-white text-sm font-medium mb-1">
            {search || selectedTags.size > 0 ? 'Ничего не найдено' : 'Библиотека пуста'}
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            {search || selectedTags.size > 0
              ? 'Попробуйте изменить поиск или теги'
              : 'Нажмите «В библиотеку» на диаграмме, чтобы сохранить схему'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {schemas.map((schema) => (
            <div
              key={schema.id}
              className="group flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#12121a] border border-[#1e1e2e] hover:border-purple-500/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{schema.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-zinc-600 text-xs">{formatDate(schema.created_at)}</p>
                  {schema.tags?.length > 0 && (
                    <div className="flex gap-1">
                      {schema.tags.slice(0, 2).map((t) => (
                        <span
                          key={t.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-full border"
                          style={{ borderColor: t.color, color: t.color }}
                        >
                          {t.name}
                        </span>
                      ))}
                      {schema.tags.length > 2 && (
                        <span className="text-[10px] text-zinc-500">+{schema.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => onLoadSchema(schema.er_data, schema.sql)}
                className="shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Открыть на холсте"
              >
                <FolderOpen size={15} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setTagMenuSchemaId(tagMenuSchemaId === schema.id ? null : schema.id)}
                  className="shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Теги"
                >
                  <TagIcon size={15} />
                </button>
                {tagMenuSchemaId === schema.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setTagMenuSchemaId(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 w-48 max-h-56 overflow-y-auto bg-[#1a1a24] border border-[#2e2e3e] rounded-lg shadow-xl p-1.5">
                      {tags.length === 0 ? (
                        <p className="text-xs text-zinc-500 px-2 py-1.5">Нет тегов. Создайте их в панели сверху.</p>
                      ) : (
                        tags.map((tag) => {
                          const checked = schema.tags.some((t) => t.id === tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={(e) => { e.stopPropagation(); handleToggleSchemaTag(schema, tag.id); }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs rounded hover:bg-white/5"
                            >
                              <input type="checkbox" readOnly checked={checked} className="accent-purple-500" />
                              <span className="flex-1 text-zinc-200">{tag.name}</span>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => handleExport(schema)}
                disabled={exportingId === schema.id}
                className="shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
                title={isPro ? 'Экспорт SQL' : 'Экспорт SQL (только Pro)'}
              >
                {isPro ? <Download size={15} /> : <Lock size={15} />}
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
      )}
    </div>
  );
}
