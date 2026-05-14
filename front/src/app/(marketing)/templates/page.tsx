'use client';

import { Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { TagPill } from '@/components/ui/TagPill';
import { CategoryChips, type CategoryItem } from '@/components/templates/CategoryChips';
import { SearchInput } from '@/components/templates/SearchInput';
import { SortDropdown, type SortKey, type SortOption } from '@/components/templates/SortDropdown';
import { TagsFilter } from '@/components/templates/TagsFilter';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { CATEGORY_LABELS, categoryLabel } from '@/lib/categoryLabels';
import { fetchTemplates } from '@/lib/api/templates';
import { fetchTags } from '@/lib/api/tags';
import { getErrorMessage } from '@/lib/error';
import type { PaginatedResponse, SchemaTemplate, Tag } from '@/types';
import styles from './page.module.css';

const PAGE_SIZE = 12;

const SORT_OPTIONS: SortOption<SortKey>[] = [
  { value: 'popular', label: 'Популярные' },
  { value: 'recent', label: 'Свежие' },
  { value: 'name', label: 'По алфавиту' },
];

type ViewMode = 'grid' | 'list';

function parseSort(value: string | null): SortKey {
  return value === 'recent' || value === 'name' ? value : 'popular';
}

function parseViewMode(value: string | null): ViewMode {
  return value === 'list' ? 'list' : 'grid';
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={null}>
      <TemplatesPageInner />
    </Suspense>
  );
}

function TemplatesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [category, setCategory] = useState(() => searchParams.get('category') ?? 'all');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() =>
    searchParams.get('tags')?.split(',').filter(Boolean) ?? [],
  );
  const [sort, setSort] = useState<SortKey>(() => parseSort(searchParams.get('sort')));
  const [viewMode, setViewMode] = useState<ViewMode>(() => parseViewMode(searchParams.get('view')));
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page') ?? 1) || 1));

  const deferredSearch = useDeferredValue(search);

  const [data, setData] = useState<PaginatedResponse<SchemaTemplate> | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredSearch) params.set('q', deferredSearch);
    if (category !== 'all') params.set('category', category);
    if (selectedTagIds.length > 0) params.set('tags', selectedTagIds.join(','));
    if (sort !== 'popular') params.set('sort', sort);
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(qs ? `/templates?${qs}` : '/templates', { scroll: false });
  }, [deferredSearch, category, selectedTagIds, sort, viewMode, page, router]);

  useEffect(() => {
    fetchTags()
      .then(setAllTags)
      .catch(() => setAllTags([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTemplates({
      search: deferredSearch || undefined,
      category: category === 'all' ? undefined : category,
      tags: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      sort,
      page,
    })
      .then((res) => {
        if (cancelled) return;
        setData(res);
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
  }, [deferredSearch, category, selectedTagIds, sort, page]);

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleCategoryChange(v: string) {
    setCategory(v);
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

  const categories: CategoryItem[] = useMemo(() => {
    const items: CategoryItem[] = [{ value: 'all', label: 'Все' }];
    for (const key of Object.keys(CATEGORY_LABELS)) {
      items.push({ value: key, label: categoryLabel(key) });
    }
    return items;
  }, []);

  const tagCounts = useMemo<Record<string, number>>(() => ({}), []);

  const total = data?.count ?? 0;
  const results = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const activeTagObjects = useMemo(
    () => selectedTagIds.map((id) => allTags.find((t) => t.id === id)).filter(Boolean) as Tag[],
    [selectedTagIds, allTags],
  );

  function resetAll() {
    setSearch('');
    setCategory('all');
    setSelectedTagIds([]);
    setSort('popular');
    setPage(1);
  }

  const hasActiveFilters = !!deferredSearch || category !== 'all' || selectedTagIds.length > 0;
  const showInitialSkeleton = loading && !data;

  return (
    <>
      <section className={styles.header}>
        <div className="container">
          <span className={`micro ${styles.label}`}>Шаблоны · сообщество</span>
          <h1 className={styles.title}>Готовые схемы баз данных</h1>
          <p className={styles.sub}>
            Форкайте проверенные шаблоны от сообщества или начните свой и опубликуйте — пусть им пользуются другие.
          </p>
          <div className={styles.stats}>
            <span className={styles.statDot} />
            <span>
              {total > 0 ? `${total} шаблонов` : 'Загружаем шаблоны…'} · обновлено сегодня
            </span>
          </div>
        </div>
      </section>

      <section className={styles.filters}>
        <div className={`container ${styles.filtersInner}`}>
          <SearchInput value={search} onChange={handleSearchChange} />
          <CategoryChips items={categories} active={category} onChange={handleCategoryChange} />
          <div className={styles.filterTail}>
            <TagsFilter
              allTags={allTags}
              selectedIds={selectedTagIds}
              onChange={handleTagsChange}
              counts={tagCounts}
            />
            <SortDropdown value={sort} onChange={handleSortChange} options={SORT_OPTIONS} />
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.metaBar}>
          <div className={styles.metaLeft}>
            Найдено <b>{total}</b> шаблонов
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

        {error ? (
          <div className={styles.empty}>
            <Icon name="circle-alert" size={40} className={styles.emptyIcon} />
            <h3>Не удалось загрузить шаблоны</h3>
            <p>{error}</p>
            <Button variant="primary" size="sm" onClick={() => setPage((p) => p)}>
              Повторить
            </Button>
          </div>
        ) : showInitialSkeleton ? (
          <div className={viewMode === 'grid' ? styles.grid : styles.list}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: viewMode === 'grid' ? 220 : 96,
                  borderRadius: 12,
                  background:
                    'linear-gradient(90deg, var(--surface-2, #1a1a1a) 0%, var(--surface-3, #222) 50%, var(--surface-2, #1a1a1a) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'pulse 1.6s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className={styles.empty}>
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
          <div
            className={viewMode === 'grid' ? styles.grid : styles.list}
            style={loading ? { opacity: 0.55, transition: 'opacity 120ms' } : undefined}
          >
            {results.map((t) => (
              <TemplateCard key={t.id} template={t} variant={viewMode === 'list' ? 'list' : 'default'} />
            ))}
          </div>
        )}

        <Pagination total={total} pageSize={PAGE_SIZE} currentPage={safePage} onChange={setPage} />
      </div>
    </>
  );
}
