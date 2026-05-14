'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { TagPill } from '@/components/ui/TagPill';
import { ReadonlyERCanvas } from '@/components/er-diagram/ReadonlyERCanvas';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { categoryLabel } from '@/lib/categoryLabels';
import { relativeTime } from '@/lib/relativeTime';
import { highlightSqlLine } from '@/lib/sql-highlight';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { fetchTemplate, fetchTemplates, forkTemplate } from '@/lib/api/templates';
import { getErrorBody, getErrorMessage, getStatus } from '@/lib/error';
import type { SchemaTemplate, TableNote } from '@/types';
import styles from './page.module.css';

type TabValue = 'diagram' | 'sql' | 'description' | 'notes';

function authorInitials(username: string): string {
  const cleaned = username.replace(/[._-]+/g, ' ').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

function describeFeatures(template: SchemaTemplate): string[] {
  const features: string[] = [];
  const usesUuid = template.er_data.nodes.some((n) =>
    n.data.columns.some((c) => c.isPrimary && c.type.toUpperCase().includes('UUID')),
  );
  if (usesUuid) features.push('Использует UUID для первичных ключей');
  features.push(`${template.er_data.nodes.length} таблиц, ${template.er_data.edges.length} связей через внешние ключи`);
  if (template.tags.length > 0) {
    const names = template.tags.slice(0, 3).map((t) => t.name).join(', ');
    features.push(`Покрывает темы: ${names}`);
  }
  features.push('Готово к импорту в PostgreSQL — структура нормализована');
  return features;
}

const NOTE_TYPE_LABEL: Record<TableNote['type'], string> = {
  info: 'Info',
  warning: 'Warning',
  idea: 'Idea',
  todo: 'TODO',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TemplateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [template, setTemplate] = useState<SchemaTemplate | null>(null);
  const [related, setRelated] = useState<SchemaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTemplate(id)
      .then((t) => {
        if (cancelled) return;
        setTemplate(t);
        fetchTemplates({ category: t.category, sort: 'popular' })
          .then((r) => {
            if (cancelled) return;
            setRelated(r.results.filter((rt) => rt.id !== t.id).slice(0, 3));
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
  if (loading || !template) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Загрузка шаблона…
      </div>
    );
  }

  return <TemplateView template={template} related={related} />;
}

function TemplateView({
  template,
  related,
}: {
  template: SchemaTemplate;
  related: SchemaTemplate[];
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<TabValue>('diagram');
  const [forking, setForking] = useState(false);

  const notes = template.notes ?? [];

  const initials = authorInitials(template.author.username);

  async function handleFork() {
    if (!user) {
      const next = encodeURIComponent(`/templates/${template.id}`);
      router.push(`/login?next=${next}`);
      return;
    }
    setForking(true);
    try {
      const schema = await forkTemplate(template.id);
      toast.success('Шаблон форкнут в вашу библиотеку');
      router.push(`/library/${schema.id}`);
    } catch (err) {
      const body = getErrorBody(err);
      if (getStatus(err) === 403 && body?.error === 'limit_reached') {
        toast.error('Достигнут лимит 5 схем. Обновитесь до Pro.');
      } else {
        toast.error(getErrorMessage(err));
      }
      setForking(false);
    }
  }

  function handleShare() {
    try {
      void navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  }

  function handleReport() {
    toast.info('Спасибо, мы получили сообщение');
  }

  function handleCopySql() {
    try {
      void navigator.clipboard.writeText(template.sql);
      toast.success('SQL скопирован');
    } catch {
      toast.error('Не удалось скопировать SQL');
    }
  }

  function handleDownloadSql() {
    toast.info('Войдите и форкните, чтобы скачать .sql');
  }

  return (
    <>
      <div className="container">
        <nav className={styles.crumb} aria-label="Хлебные крошки">
          <Link href="/templates">Шаблоны</Link>
          <Icon name="chevron-right" size={12} className={styles.crumbSep} />
          <Link href={`/templates?category=${encodeURIComponent(template.category)}`}>
            {categoryLabel(template.category)}
          </Link>
          <Icon name="chevron-right" size={12} className={styles.crumbSep} />
          <span className={styles.crumbCur}>{template.name}</span>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.h1}>{template.name}</h1>
              <p className={styles.desc}>{template.description}</p>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <Avatar initials={initials} size={16} />
                  <Link className={styles.metaLink} href="#">by {template.author.username}</Link>
                </span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.metaItem}>
                  <Icon name="users" size={12} />
                  {template.fork_count.toLocaleString('ru-RU')} форков
                </span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.metaItem}>
                  <Icon name="calendar" size={12} />
                  создан {relativeTime(template.created_at)}
                </span>
              </div>
            </div>

            <aside className={styles.heroRight}>
              <Button
                variant="primary"
                size="lg"
                icon="git-fork"
                onClick={handleFork}
                loading={forking}
                className={styles.forkBtn}
              >
                Форкнуть к себе
              </Button>
              {!user && (
                <p className={styles.forkHint}>
                  Нужен аккаунт, чтобы форкнуть.{' '}
                  <Link href="/login" className={styles.forkLink}>Войти →</Link>
                </p>
              )}

              <div className={styles.metaCard}>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Категория</span>
                  <span className={styles.catPill}>{categoryLabel(template.category)}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Таблиц</span>
                  <span className={styles.v}>{template.er_data.nodes.length}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Связей</span>
                  <span className={styles.v}>{template.er_data.edges.length}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Диалект превью</span>
                  <span className={styles.v}>PostgreSQL</span>
                </div>
              </div>

              <div className={styles.tagsWrap}>
                {template.tags.map((tag) => (
                  <TagPill key={tag.id} name={tag.name} color={tag.color} />
                ))}
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
              { value: 'description', label: 'Описание' },
              { value: 'notes', label: `Заметки автора (${notes.length})` },
            ]}
            value={tab}
            onChange={setTab}
            className={styles.tabs}
          />
          <div className={styles.tabsActions}>
            <button type="button" className={styles.actBtn} onClick={handleShare}>
              <Icon name="share-2" size={14} />
              <span>Поделиться</span>
            </button>
            <button type="button" className={styles.actBtn} onClick={handleReport}>
              <Icon name="flag" size={14} />
              <span>Сообщить о проблеме</span>
            </button>
          </div>
        </div>
      </div>

      <section className={styles.tabContent}>
        {tab === 'diagram' && <ReadonlyERCanvas erData={template.er_data} />}

        {tab === 'sql' && (
          <SqlView sql={template.sql} onCopy={handleCopySql} onDownload={handleDownloadSql} />
        )}

        {tab === 'description' && (
          <div className="container">
            <div className={styles.descBlock}>
              <p className={styles.descText}>{template.description}</p>
              <h3 className={styles.featuresTitle}>Особенности схемы</h3>
              <ul className={styles.featuresList}>
                {describeFeatures(template).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'notes' && (
          <div className="container">
            <div className={styles.notesBlock}>
              {notes.length === 0 ? (
                <div className={styles.notesEmpty}>
                  <Icon name="sticky-note" size={40} className={styles.notesEmptyIcon} />
                  <h3>Заметок пока нет</h3>
                  <p>Автор не оставил заметок к этому шаблону.</p>
                </div>
              ) : (
                notes.map((note) => <NoteCard key={note.id} note={note} />)
              )}
            </div>
          </div>
        )}
      </section>

      <div className="container">
        <section className={styles.related}>
          <span className={`micro ${styles.relatedLabel}`}>Похожие шаблоны</span>
          <h2 className={styles.relatedTitle}>Другое в категории {categoryLabel(template.category)}</h2>
          <div className={styles.relatedGrid}>
            {related.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function SqlView({
  sql,
  onCopy,
  onDownload,
}: {
  sql: string;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const lines = sql.split('\n');

  return (
    <div className={styles.sqlWrap}>
      <div className={`container ${styles.sqlHeader}`}>
        <span className={styles.dialectChip}>PostgreSQL</span>
        <span className={styles.sqlMeta}>{lines.length} строк</span>
        <div className={styles.sqlActions}>
          <button type="button" className={styles.iconBtn} onClick={onCopy} aria-label="Скопировать SQL">
            <Icon name="copy" size={14} />
          </button>
          <Button variant="ghost" size="sm" icon="lock" onClick={onDownload}>
            Скачать .sql
          </Button>
        </div>
      </div>
      <pre className={styles.sqlBody}>
        <code>
          {lines.map((line, i) => (
            <div key={i} className={styles.sqlLine}>
              <span className={styles.lineNum}>{i + 1}</span>
              <span className={styles.lineText}>{highlightSqlLine(line) ?? ' '}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function NoteCard({ note }: { note: TableNote }) {
  return (
    <div className={`${styles.noteCard} ${styles[`note_${note.type}`]}`}>
      <div className={styles.noteHead}>
        <span className={`${styles.noteBadge} ${styles[`badge_${note.type}`]}`}>
          {NOTE_TYPE_LABEL[note.type]}
        </span>
        <span className={styles.noteTable}>{note.table_name ?? 'General'}</span>
        <span className={styles.noteTime}>{relativeTime(note.created_at)}</span>
      </div>
      <p className={styles.noteBody}>{note.body}</p>
    </div>
  );
}
