'use client';

import Link from 'next/link';
import { Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppNav } from '@/components/layout/AppNav';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { TagPill } from '@/components/ui/TagPill';
import { SchemaCard } from '@/components/library/SchemaCard';
import { SearchInput } from '@/components/templates/SearchInput';
import { SortDropdown, type SortOption } from '@/components/templates/SortDropdown';
import { TagsFilter } from '@/components/templates/TagsFilter';
import { fetchSchemas, deleteSchema } from '@/lib/api/schemas';
import { fetchTags } from '@/lib/api/tags';
import { getErrorMessage } from '@/lib/error';
import { isPro } from '@/lib/user-helpers';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import type { SavedSchema, Tag } from '@/types';
import styles from './page.module.css';

const PAGE_SIZE = 12;
const FREE_LIMIT = 5;

type SortKey = 'recent' | 'name' | 'size';
type ViewMode = 'grid' | 'list';

const COMPARATORS: Record<SortKey, (a: SavedSchema, b: SavedSchema) => number> = {
  recent: (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  name: (a, b) => a.name.localeCompare(b.name, 'ru'),
  size: (a, b) => b.er_data.nodes.length - a.er_data.nodes.length,
};

const SORT_OPTIONS: SortOption<SortKey>[] = [
  { value: 'recent', label: 'Недавние' },
  { value: 'name', label: 'По алфавиту' },
  { value: 'size', label: 'По размеру' },
];

function parseSort(value: string | null): SortKey {
  return value === 'name' || value === 'size' ? value : 'recent';
}

function parseViewMode(value: string | null): ViewMode {
  return value === 'list' ? 'list' : 'grid';
}

export default function LibraryPage() {
  return (
    <>
      <AppNav />
      <main>
        <Suspense fallback={null}>
          <LibraryInner />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function LibraryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() =>
    searchParams.get('tags')?.split(',').filter(Boolean) ?? [],
  );
  const [sort, setSort] = useState<SortKey>(() => parseSort(searchParams.get('sort')));
  const [viewMode, setViewMode] = useState<ViewMode>(() => parseViewMode(searchParams.get('view')));
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page') ?? 1) || 1));

  const [allSchemas, setAllSchemas] = useState<SavedSchema[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredSearch) params.set('q', deferredSearch);
    if (selectedTagIds.length > 0) params.set('tags', selectedTagIds.join(','));
    if (sort !== 'recent') params.set('sort', sort);
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(qs ? `/library?${qs}` : '/library', { scroll: false });
  }, [deferredSearch, selectedTagIds, sort, viewMode, page, router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchSchemas(), fetchTags()])
      .then(([schemas, tags]) => {
        if (cancelled) return;
        setAllSchemas(schemas);
        setAllTags(tags);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const schemas = allSchemas;
  const totalCount = schemas.length;
  const isFree = !isPro(user);
  const isAtLimit = totalCount >= FREE_LIMIT && isFree;

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleTagsChange(next: string[]) {
    setSelectedTagIds(next);
    setPage(1);
  }

  function handleSortChange(v: SortKey) {
    setSort(v);
    setPage(1);
  }

  async function handleDelete(id: string) {
    const prev = allSchemas;
    setAllSchemas((s) => s.filter((sc) => sc.id !== id));
    try {
      await deleteSchema(id);
      toast.success('Схема удалена');
    } catch (err) {
      setAllSchemas(prev);
      toast.error(getErrorMessage(err));
    }
  }

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of schemas) for (const tag of s.tags) counts[tag.id] = (counts[tag.id] ?? 0) + 1;
    return counts;
  }, [schemas]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const idsSet = new Set(selectedTagIds);
    return schemas
      .filter((s) => {
        if (q) {
          const inName = s.name.toLowerCase().includes(q);
          const inDesc = s.description?.toLowerCase().includes(q) ?? false;
          const inTags = s.tags.some((t) => t.name.toLowerCase().includes(q));
          if (!inName && !inDesc && !inTags) return false;
        }
        if (idsSet.size > 0 && !s.tags.some((tag) => idsSet.has(tag.id))) return false;
        return true;
      })
      .sort(COMPARATORS[sort]);
  }, [schemas, deferredSearch, selectedTagIds, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeTagObjects = useMemo(
    () => selectedTagIds.map((id) => allTags.find((t) => t.id === id)).filter(Boolean) as Tag[],
    [selectedTagIds, allTags],
  );

  function resetAll() {
    setSearch('');
    setSelectedTagIds([]);
    setSort('recent');
    setPage(1);
  }

  const hasActiveFilters = !!deferredSearch || selectedTagIds.length > 0;
  const isLibraryEmpty = !loading && !error && schemas.length === 0;

  if (loading) {
    return (
      <>
        <section className={styles.header}>
          <div className="container">
            <span className={`micro ${styles.label}`}>Библиотека · ваши схемы</span>
            <h1 className={styles.title}>Мои схемы</h1>
          </div>
        </section>
        <div className="container" style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
          Загружаем схемы…
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className={styles.header}>
          <div className="container">
            <span className={`micro ${styles.label}`}>Библиотека · ваши схемы</span>
            <h1 className={styles.title}>Мои схемы</h1>
          </div>
        </section>
        <div className="container" style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
          <p>Не удалось загрузить: {error}</p>
          <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
            Повторить
          </Button>
        </div>
      </>
    );
  }

  if (isLibraryEmpty) {
    return (
      <>
        <section className={styles.header}>
          <div className="container">
            <span className={`micro ${styles.label}`}>Библиотека · ваши схемы</span>
            <h1 className={styles.title}>Мои схемы</h1>
          </div>
        </section>
        <div className="container">
          <div className={styles.emptyLibrary}>
            <Icon name="database" size={48} className={styles.emptyIcon} />
            <h2 className={styles.emptyH2}>Пока нет сохранённых схем</h2>
            <p className={styles.emptyText}>
              Создайте схему в дашборде — диалогом или импортом. Все сохранённые схемы появятся здесь.
            </p>
            <Button variant="primary" as="a" href="/dashboard" icon="arrow-up" iconPosition="right">
              Открыть дашборд
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <section className={styles.header}>
        <div className="container">
          <span className={`micro ${styles.label}`}>Библиотека · ваши схемы</span>
          <h1 className={styles.title}>Мои схемы</h1>
          <p className={styles.sub}>
            Все ваши сохранённые ER-диаграммы. Редактируйте, экспортируйте или публикуйте как шаблон для сообщества.
          </p>
          <div className={styles.stats}>
            <span>
              <b>{isFree ? `${totalCount} из ${FREE_LIMIT}` : totalCount}</b> схем · {isFree ? 'бесплатный тариф' : 'Pro'}
            </span>
            {isAtLimit && (
              <Link href="/pricing" className={styles.quotaPill}>
                Лимит достигнут · Перейти на Pro →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className={styles.filters}>
        <div className={`container ${styles.filtersInner}`}>
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Поиск по моим схемам..."
          />
          <div className={styles.filterSpacer} />
          <div className={styles.filterTail}>
            <TagsFilter
              allTags={allTags}
              selectedIds={selectedTagIds}
              onChange={handleTagsChange}
              counts={tagCounts}
            />
            <SortDropdown value={sort} onChange={handleSortChange} options={SORT_OPTIONS} />
            <div className={styles.viewMode}>
              <button
                type="button"
                className={viewMode === 'grid' ? styles.viewActive : ''}
                onClick={() => setViewMode('grid')}
                aria-label="Сетка"
                aria-pressed={viewMode === 'grid'}
              >
                <Icon name="layout-grid" size={14} />
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? styles.viewActive : ''}
                onClick={() => setViewMode('list')}
                aria-label="Список"
                aria-pressed={viewMode === 'list'}
              >
                <Icon name="list" size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.metaBar}>
          <span>
            Найдено <b>{filtered.length}</b> схем
          </span>
          {activeTagObjects.length > 0 && (
            <>
              <span className={styles.metaSep}>·</span>
              <span className={styles.metaTagsLabel}>фильтры:</span>
              <span className={styles.metaTags}>
                {activeTagObjects.map((tag) => (
                  <TagPill
                    key={tag.id}
                    name={tag.name}
                    color={tag.color}
                    onRemove={() => handleTagsChange(selectedTagIds.filter((id) => id !== tag.id))}
                  />
                ))}
              </span>
            </>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.emptySearch}>
            <Icon name="search-x" size={40} className={styles.emptyIcon} />
            <h3>Ничего не нашлось</h3>
            <p>Попробуйте изменить поисковый запрос или сбросить фильтры.</p>
            {hasActiveFilters && (
              <Button variant="primary" size="sm" onClick={resetAll}>
                Сбросить фильтры
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? styles.grid : styles.list}>
            {paginated.map((s) => (
              <SchemaCard
                key={s.id}
                schema={s}
                variant={viewMode === 'list' ? 'list' : 'default'}
                onDelete={() => handleDelete(s.id)}
              />
            ))}
          </div>
        )}

        <Pagination
          total={filtered.length}
          pageSize={PAGE_SIZE}
          currentPage={safePage}
          onChange={setPage}
        />
      </div>
    </>
  );
}
