'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { AppNav } from '@/components/layout/AppNav';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Tabs } from '@/components/ui/Tabs';
import { TagPill } from '@/components/ui/TagPill';
import { ReadonlyERCanvas } from '@/components/er-diagram/ReadonlyERCanvas';
import { NoteCard } from '@/components/notes/NoteCard';
import { PublishModal } from '@/components/library/PublishModal';
import { relativeTime } from '@/lib/relativeTime';
import { highlightSqlLine } from '@/lib/sql-highlight';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { fetchSchema, deleteSchema, exportSql } from '@/lib/api/schemas';
import { fetchNotes } from '@/lib/api/notes';
import { isPro } from '@/lib/user-helpers';
import { getErrorMessage, getStatus } from '@/lib/error';
import type { SavedSchema, TableNote } from '@/types';
import styles from './page.module.css';

type TabValue = 'diagram' | 'sql' | 'notes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LibraryDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [schema, setSchema] = useState<SavedSchema | null>(null);
  const [notes, setNotes] = useState<TableNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSchema(id)
      .then((s) => {
        if (cancelled) return;
        setSchema(s);
        setNotes(s.notes ?? []);
        // fallback: re-fetch notes (в случае если detail вернул пустой список из-за кэша)
        fetchNotes(id)
          .then((n) => {
            if (!cancelled) setNotes(n);
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (cancelled) return;
        if (getStatus(err) === 404) setNotFoundFlag(true);
        else toast.error(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (notFoundFlag) notFound();
  if (loading || !schema) {
    return (
      <>
        <AppNav />
        <main>
          <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Загрузка схемы…
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppNav />
      <main>
        <LibraryDetailView schema={schema} notes={notes} setNotes={setNotes} />
      </main>
      <Footer />
    </>
  );
}

function LibraryDetailView({
  schema,
  notes,
  setNotes,
}: {
  schema: SavedSchema;
  notes: TableNote[];
  setNotes: (n: TableNote[]) => void;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<TabValue>('diagram');
  const [publishOpen, setPublishOpen] = useState(false);
  const [isPublishedLocal, setIsPublishedLocal] = useState(schema.is_published);
  const [forkCountLocal, setForkCountLocal] = useState(schema.fork_count);
  const [deleting, setDeleting] = useState(false);

  const dialect = schema.sql_dialect || 'PostgreSQL';
  const tables = schema.er_data.nodes.length;
  const edges = schema.er_data.edges.length;
  const isFree = !isPro(user);
  const modalMode = isPublishedLocal ? 'manage' : 'publish';

  function handleShare() {
    try {
      void navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  }

  function handleCopySql() {
    try {
      void navigator.clipboard.writeText(schema.sql);
      toast.success('SQL скопирован');
    } catch {
      toast.error('Не удалось скопировать SQL');
    }
  }

  async function handleDownloadSql() {
    if (isFree) {
      toast.info('Доступно в Pro');
      return;
    }
    try {
      await exportSql(schema.id, `${schema.name || 'schema'}.sql`);
      toast.success('SQL скачан');
    } catch (err) {
      if (getStatus(err) === 403) {
        toast.error('Доступно в Pro плане');
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  }

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm(`Удалить «${schema.name}»? Это действие нельзя отменить.`)) return;
    setDeleting(true);
    try {
      await deleteSchema(schema.id);
      toast.success('Схема удалена');
      router.push('/library');
    } catch (err) {
      setDeleting(false);
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <div className="container">
        <nav className={styles.crumb} aria-label="Хлебные крошки">
          <Link href="/library">Моя библиотека</Link>
          <Icon name="chevron-right" size={12} className={styles.crumbSep} />
          <span className={styles.crumbCur}>{schema.name}</span>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.h1}>{schema.name}</h1>
              {schema.description && <p className={styles.desc}>{schema.description}</p>}
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <Icon name="calendar" size={12} />
                  создано {relativeTime(schema.created_at)}
                </span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.metaItem}>
                  <Icon name="clock" size={12} />
                  обновлено {relativeTime(schema.updated_at)}
                </span>
              </div>
            </div>

            <aside className={styles.heroRight}>
              <Button
                variant="primary"
                size="lg"
                icon="pencil"
                as="a"
                href={`/dashboard?schema=${schema.id}`}
                className={styles.editBtn}
              >
                Открыть в редакторе
              </Button>

              <div className={styles.actionStack}>
                <button
                  type="button"
                  className={styles.actBtn}
                  onClick={() => setPublishOpen(true)}
                >
                  <Icon name="share-2" size={14} />
                  <span>
                    {isPublishedLocal ? 'Управление публикацией' : 'Опубликовать как шаблон'}
                  </span>
                </button>

                <button
                  type="button"
                  className={`${styles.actBtn} ${isFree ? styles.actBtnLocked : ''}`}
                  onClick={handleDownloadSql}
                  title={isFree ? 'Доступно в Pro' : undefined}
                >
                  <Icon name="download" size={14} />
                  <span>Скачать SQL</span>
                  {isFree && <Icon name="lock" size={12} className={styles.lockIcon} />}
                </button>

                <button
                  type="button"
                  className={styles.actBtn}
                  onClick={() => toast.info('Экспорт появится позже')}
                >
                  <Icon name="image" size={14} />
                  <span>Экспорт PNG</span>
                </button>

                <button
                  type="button"
                  className={`${styles.actBtn} ${styles.actBtnDanger}`}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Icon name="trash" size={14} />
                  <span>{deleting ? 'Удаляю…' : 'Удалить'}</span>
                </button>
              </div>

              <div className={styles.metaCard}>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Таблиц</span>
                  <span className={styles.v}>{tables}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Связей</span>
                  <span className={styles.v}>{edges}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Диалект</span>
                  <span className={styles.v}>{dialect}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Статус</span>
                  {isPublishedLocal ? (
                    <Pill variant="info">Опубликовано</Pill>
                  ) : (
                    <Pill variant="neutral">Не опубликовано</Pill>
                  )}
                </div>
                {isPublishedLocal && (
                  <div className={styles.metaRow}>
                    <span className={styles.k}>Форков</span>
                    <span className={styles.v}>{forkCountLocal}</span>
                  </div>
                )}
              </div>

              <div className={styles.tagsBlock}>
                <div className={`micro ${styles.tagsLabel}`}>Теги</div>
                <div className={styles.tagsWrap}>
                  {schema.tags.map((tag) => (
                    <TagPill
                      key={tag.id}
                      name={tag.name}
                      color={tag.color}
                      onRemove={() => toast.info('Управление тегами появится позже')}
                    />
                  ))}
                  <button
                    type="button"
                    className={styles.tagAddBtn}
                    onClick={() => toast.info('Добавление тегов появится позже')}
                  >
                    <Icon name="plus" size={11} />
                    Тег
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <div className={styles.tabsBar}>
        <div className={`container ${styles.tabsInner}`}>
          <Tabs<TabValue>
            tabs={[
              { value: 'diagram', label: 'Диаграмма' },
              { value: 'sql', label: 'SQL' },
              { value: 'notes', label: 'Заметки', badge: notes.length },
            ]}
            value={tab}
            onChange={setTab}
            className={styles.tabs}
          />
          <div className={styles.tabsActions}>
            <button type="button" className={styles.tabActBtn} onClick={handleShare}>
              <Icon name="share-2" size={14} />
              <span>Поделиться</span>
            </button>
          </div>
        </div>
      </div>

      <section className={styles.tabContent}>
        {tab === 'diagram' && <ReadonlyERCanvas erData={schema.er_data} />}

        {tab === 'sql' && (
          <SqlView
            sql={schema.sql}
            dialect={dialect}
            onCopy={handleCopySql}
            onDownload={handleDownloadSql}
            isFree={isFree}
          />
        )}

        {tab === 'notes' && (
          <div className="container">
            <div className={styles.notesBlock}>
              <div className={styles.notesHeader}>
                <span className={`micro ${styles.notesCount}`}>
                  {notes.length === 0
                    ? 'Заметок пока нет'
                    : `${notes.length} ${notes.length === 1 ? 'заметка' : 'заметки'}`}
                </span>
                <Button
                  variant="ghost-sm"
                  icon="plus"
                  onClick={() => toast.info('Создание заметок появится позже')}
                >
                  Заметка
                </Button>
              </div>
              {notes.length === 0 ? (
                <div className={styles.notesEmpty}>
                  <Icon name="sticky-note" size={40} className={styles.notesEmptyIcon} />
                  <h3>Заметок пока нет</h3>
                  <p>Добавляйте заметки к таблицам или к схеме целиком, чтобы ничего не упустить.</p>
                </div>
              ) : (
                <ul className={styles.notesList}>
                  {notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <PublishModal
        key={publishOpen ? `${modalMode}-open` : 'closed'}
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        schema={schema}
        mode={modalMode}
        forkCount={forkCountLocal}
        onPublished={() => {
          setIsPublishedLocal(true);
          setForkCountLocal(0);
        }}
        onUnpublished={() => {
          setIsPublishedLocal(false);
          setForkCountLocal(0);
        }}
      />
    </>
  );
}

function SqlView({
  sql,
  dialect,
  onCopy,
  onDownload,
  isFree,
}: {
  sql: string;
  dialect: string;
  onCopy: () => void;
  onDownload: () => void;
  isFree: boolean;
}) {
  const lines = sql.split('\n');

  return (
    <div className={styles.sqlWrap}>
      <div className={`container ${styles.sqlHeader}`}>
        <span className={styles.dialectChip}>{dialect}</span>
        <span className={styles.sqlMeta}>{lines.length} строк</span>
        <div className={styles.sqlActions}>
          <button type="button" className={styles.iconBtn} onClick={onCopy} aria-label="Скопировать SQL">
            <Icon name="copy" size={14} />
          </button>
          <Button
            variant="ghost"
            size="sm"
            icon={isFree ? 'lock' : 'download'}
            onClick={onDownload}
          >
            Скачать .sql
          </Button>
        </div>
      </div>
      <pre className={styles.sqlBody}>
        <code>
          {lines.map((line, i) => (
            <div key={i} className={styles.sqlLine}>
              <span className={styles.lineNum}>{i + 1}</span>
              <span className={styles.lineText}>{highlightSqlLine(line) ?? ' '}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
