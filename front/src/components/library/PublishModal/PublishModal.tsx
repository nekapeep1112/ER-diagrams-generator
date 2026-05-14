'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TagPill } from '@/components/ui/TagPill';
import { Textarea } from '@/components/ui/Textarea';
import { MiniERPreview } from '@/components/templates/MiniERPreview';
import { toast } from '@/store/toastStore';
import { publishSchema, unpublishSchema } from '@/lib/api/schemas';
import { getErrorBody, getErrorMessage, getStatus } from '@/lib/error';
import type { SavedSchema, Tag } from '@/types';
import styles from './PublishModal.module.css';

type Step = 'form' | 'submitting' | 'success' | 'manage' | 'confirmUnpublish' | 'unpublishing' | 'unpublished';

const CATEGORIES = [
  'SaaS',
  'E-commerce',
  'CMS',
  'Education',
  'Finance',
  'Social',
  'Analytics',
  'IoT',
  'Healthcare',
  'Other',
];

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  schema: SavedSchema;
  mode: 'publish' | 'manage';
  forkCount: number;
  onPublished: () => void;
  onUnpublished: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/giu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'schema';
}

export function PublishModal({
  open,
  onClose,
  schema,
  mode,
  forkCount,
  onPublished,
  onUnpublished,
}: PublishModalProps) {
  const [step, setStep] = useState<Step>(mode === 'manage' ? 'manage' : 'form');
  const [name, setName] = useState(schema.name);
  const [description, setDescription] = useState(schema.description ?? '');
  const [category, setCategory] = useState<string>('');
  const [tosChecked, setTosChecked] = useState(false);
  const [tagIds, setTagIds] = useState<string[]>(() => schema.tags.map((t) => t.id));
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const catMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!catMenuOpen) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [catMenuOpen]);

  async function handlePublish() {
    setStep('submitting');
    try {
      await publishSchema(schema.id, { name, description, category });
      setStep('success');
      onPublished();
    } catch (err) {
      const body = getErrorBody(err);
      if (getStatus(err) === 400 && body?.error === 'already_published') {
        toast.info('Уже опубликовано');
        setStep('manage');
        onPublished();
        return;
      }
      toast.error(getErrorMessage(err));
      setStep('form');
    }
  }

  async function handleUnpublish() {
    setStep('unpublishing');
    try {
      await unpublishSchema(schema.id);
      setStep('unpublished');
      onUnpublished();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setStep('manage');
    }
  }

  function handleCopyLink() {
    const link = `er-database.app/templates/${slugify(name)}`;
    try {
      void navigator.clipboard.writeText(link);
      toast.success('Ссылка скопирована');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  }

  function removeTag(tagId: string) {
    setTagIds((prev) => prev.filter((id) => id !== tagId));
  }

  const activeTags: Tag[] = schema.tags.filter((t) => tagIds.includes(t.id));
  const link = `er-database.app/templates/${slugify(name)}`;

  // ── HEADERS / BODIES / FOOTERS ──────────────────────────────

  let header: React.ReactNode = null;
  let body: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (step === 'form' || step === 'submitting') {
    const isSubmitting = step === 'submitting';
    header = (
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.iconBadge}><Icon name="share-2" size={14} /></span>
          Опубликовать как шаблон
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <Icon name="x" size={16} />
        </button>
      </div>
    );
    body = (
      <div className={styles.formBody}>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Название</label>
            <span className={styles.counter}>{name.length} / 60</span>
          </div>
          <Input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} />
        </div>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Описание</label>
            <span className={styles.markdownBadge}>Markdown</span>
          </div>
          <Textarea
            mono={false}
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 280))}
          />
          <div className={styles.hint}>Будет показано на странице шаблона.</div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Категория</label>
          <div className={styles.dropdownWrap} ref={catMenuRef}>
            <button
              type="button"
              className={`${styles.dropdownTrigger} ${!category ? styles.dropdownPlaceholder : ''}`}
              onClick={() => setCatMenuOpen((v) => !v)}
            >
              <span>{category || 'Выберите категорию'}</span>
              <Icon name="chevron-down" size={12} />
            </button>
            {catMenuOpen && (
              <div className={styles.dropdownMenu} role="menu">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.dropdownItem} ${c === category ? styles.dropdownActive : ''}`}
                    onClick={() => {
                      setCategory(c);
                      setCatMenuOpen(false);
                    }}
                  >
                    <span className={styles.dropdownDot} />
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Теги · до 5</label>
          <div className={styles.tagInput}>
            {activeTags.map((tag) => (
              <TagPill
                key={tag.id}
                name={tag.name}
                color={tag.color}
                onRemove={() => removeTag(tag.id)}
              />
            ))}
            <button
              type="button"
              className={styles.tagAddBtn}
              onClick={() => toast.info('Добавление тегов появится позже')}
            >
              + Тег
            </button>
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Превью шаблона</label>
          <div className={styles.previewBox}>
            <MiniERPreview templateId={schema.id} height={140} />
          </div>
        </div>
        <label
          className={`${styles.checkRow} ${tosChecked ? styles.checkRowOn : ''}`}
        >
          <input
            type="checkbox"
            className={styles.checkInput}
            checked={tosChecked}
            onChange={(e) => setTosChecked(e.target.checked)}
          />
          <span className={styles.checkBox}>
            {tosChecked && <Icon name="check" size={12} strokeWidth={3} />}
          </span>
          <span>
            <span className={styles.checkTitle}>Согласен с правилами публикации</span>
            <span className={styles.checkDesc}>
              Шаблон станет доступен всем, я могу скрыть его в любой момент.
            </span>
          </span>
        </label>
      </div>
    );
    footer = (
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          variant="primary"
          icon="share-2"
          onClick={handlePublish}
          disabled={!category || !tosChecked || isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Публикую...' : 'Опубликовать'}
        </Button>
      </div>
    );
  } else if (step === 'success') {
    header = (
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={`${styles.iconBadge} ${styles.iconBadgeSuccess}`}>
            <Icon name="check-circle" size={14} />
          </span>
          Шаблон опубликован
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <Icon name="x" size={16} />
        </button>
      </div>
    );
    body = (
      <div className={styles.successBody}>
        <p className={styles.successText}>
          <span className={styles.highlight}>«{name}»</span> теперь доступен в галерее шаблонов
          сообщества. Вы можете отозвать публикацию в любой момент.
        </p>
        <div className={styles.field}>
          <label className={styles.label}>Публичная ссылка</label>
          <div className={styles.linkRow}>
            <input className={styles.linkInput} readOnly value={link} />
            <button type="button" className={styles.copyBtn} onClick={handleCopyLink}>
              <Icon name="copy" size={14} />
              <span>Копировать</span>
            </button>
          </div>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Категория</div>
            <div className={styles.statValue}>{category}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Видимость</div>
            <div className={`${styles.statValue} ${styles.statValueSuccess}`}>Публичная</div>
          </div>
        </div>
      </div>
    );
    footer = (
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onClose}>Закрыть</Button>
        <Button variant="primary" as="a" href="/templates" icon="external-link">
          Открыть в галерее
        </Button>
      </div>
    );
  } else if (step === 'manage') {
    header = (
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.iconBadge}><Icon name="share-2" size={14} /></span>
          Управление публикацией
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <Icon name="x" size={16} />
        </button>
      </div>
    );
    body = (
      <div className={styles.manageBody}>
        <div className={styles.manageStatus}>
          <span className={styles.statusDot} />
          <span>Опубликовано · {forkCount} форков</span>
        </div>
        <p className={styles.manageText}>
          Шаблон <span className={styles.highlight}>«{schema.name}»</span> доступен в галерее
          сообщества.
        </p>
        <div className={styles.field}>
          <label className={styles.label}>Публичная ссылка</label>
          <div className={styles.linkRow}>
            <input className={styles.linkInput} readOnly value={link} />
            <button type="button" className={styles.copyBtn} onClick={handleCopyLink}>
              <Icon name="copy" size={14} />
              <span>Копировать</span>
            </button>
          </div>
        </div>
        <Link href="/templates" className={styles.galleryLink}>
          <Icon name="external-link" size={12} />
          Открыть в галерее
        </Link>
        <button
          type="button"
          className={styles.dangerInline}
          onClick={() => setStep('confirmUnpublish')}
        >
          <Icon name="x" size={14} />
          Отозвать публикацию
        </button>
      </div>
    );
    footer = (
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onClose}>Закрыть</Button>
      </div>
    );
  } else if (step === 'confirmUnpublish' || step === 'unpublishing') {
    const isUnpubLoading = step === 'unpublishing';
    header = (
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={`${styles.iconBadge} ${styles.iconBadgeDanger}`}>
            <Icon name="circle-alert" size={14} />
          </span>
          Отозвать публикацию
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <Icon name="x" size={16} />
        </button>
      </div>
    );
    body = (
      <div className={styles.confirmBody}>
        <p>
          Вы уверены? Шаблон станет недоступен в галерее, но останется в вашей библиотеке.
          {forkCount > 0 && (
            <>
              {' '}
              Уже сделанные форки ({forkCount}) останутся у их владельцев.
            </>
          )}
        </p>
      </div>
    );
    footer = (
      <div className={styles.footer}>
        <Button variant="ghost" onClick={() => setStep('manage')} disabled={isUnpubLoading}>
          Отмена
        </Button>
        <Button
          variant="ghost"
          danger
          icon="trash"
          onClick={handleUnpublish}
          loading={isUnpubLoading}
          disabled={isUnpubLoading}
        >
          {isUnpubLoading ? 'Отзываю...' : 'Отозвать'}
        </Button>
      </div>
    );
  } else if (step === 'unpublished') {
    header = (
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={`${styles.iconBadge} ${styles.iconBadgeSuccess}`}>
            <Icon name="check-circle" size={14} />
          </span>
          Публикация отозвана
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <Icon name="x" size={16} />
        </button>
      </div>
    );
    body = (
      <div className={styles.successBody}>
        <p className={styles.successText}>
          Шаблон <span className={styles.highlight}>«{schema.name}»</span> больше не доступен в
          галерее. Вы можете опубликовать его снова в любой момент.
        </p>
      </div>
    );
    footer = (
      <div className={styles.footer}>
        <Button variant="primary" onClick={onClose}>Закрыть</Button>
      </div>
    );
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Публикация шаблона" header={header} footer={footer}>
      {body}
    </Modal>
  );
}
