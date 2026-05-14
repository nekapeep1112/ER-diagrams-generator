'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AppNav } from '@/components/layout/AppNav';
import { Footer } from '@/components/layout/Footer';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { getInitials } from '@/lib/mocks/user';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { isPro as checkIsPro } from '@/lib/user-helpers';
import { getErrorMessage } from '@/lib/error';
import styles from './page.module.css';

const SQL_DIALECTS = ['PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'Oracle'] as const;
type SqlDialect = (typeof SQL_DIALECTS)[number];

interface ProfileForm {
  username: string;
  bio: string;
  default_sql_dialect: SqlDialect;
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const initial: ProfileForm = useMemo(
    () => ({
      username: user?.username ?? '',
      bio: user?.bio ?? '',
      default_sql_dialect: (user?.default_sql_dialect as SqlDialect) ?? 'PostgreSQL',
    }),
    [user?.username, user?.bio, user?.default_sql_dialect],
  );

  const [formData, setFormData] = useState<ProfileForm>(initial);
  const [originalData, setOriginalData] = useState<ProfileForm>(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(initial);
    setOriginalData(initial);
  }, [initial]);

  const hasChanges = useMemo(
    () =>
      formData.username !== originalData.username ||
      formData.bio !== originalData.bio ||
      formData.default_sql_dialect !== originalData.default_sql_dialect,
    [formData, originalData],
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        username: formData.username,
        bio: formData.bio,
        default_sql_dialect: formData.default_sql_dialect,
      });
      toast.success('Профиль обновлён');
      setOriginalData(formData);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => setFormData(originalData);

  const isPro = checkIsPro(user);

  if (!user) {
    return (
      <>
        <AppNav />
        <main>
          <div className={styles.container}>Загрузка профиля…</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppNav />
      <main>
        <div className={styles.container}>
          <div className="micro">АККАУНТ · ваш профиль</div>
          <h1 className={styles.pageTitle}>Профиль</h1>

          <Card className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Аватар</h3>
              <Button
                variant="ghost-sm"
                onClick={() => toast.info('Загрузка аватара появится позже')}
              >
                Изменить
              </Button>
            </div>
            <div className={styles.avatarRow}>
              <Avatar initials={getInitials(user.username)} size={64} />
              <div className={styles.avatarInfo}>
                <h3 className={styles.userName}>{user.username}</h3>
                <div className={styles.userEmail}>{user.email}</div>
                <Pill variant={isPro ? 'purple' : 'info'} className={styles.planPill}>
                  ● {isPro ? 'Pro plan' : 'Free plan'}
                </Pill>
              </div>
            </div>
          </Card>

          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>Личные данные</h3>
            <div className={styles.formGrid}>
              <Field label="ИМЯ ПОЛЬЗОВАТЕЛЯ">
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={loading}
                />
              </Field>

              <Field label="ЭЛЕКТРОННАЯ ПОЧТА" hint="Email нельзя изменить">
                <Input type="email" value={user.email} disabled />
              </Field>

              <Field label="БИОГРАФИЯ">
                <Textarea
                  mono={false}
                  placeholder="Расскажите о себе..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={styles.bioTextarea}
                  disabled={loading}
                />
              </Field>

              <Field label="ДИАЛЕКТ SQL ПО УМОЛЧАНИЮ">
                <SqlDialectSelect
                  value={formData.default_sql_dialect}
                  onChange={(v) => setFormData({ ...formData, default_sql_dialect: v })}
                  disabled={loading}
                />
              </Field>
            </div>

            <div className={styles.formActions}>
              <Button
                variant="ghost"
                disabled={!hasChanges || loading}
                onClick={handleCancel}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                disabled={!hasChanges}
                loading={loading}
                onClick={handleSave}
              >
                Сохранить изменения
              </Button>
            </div>
          </Card>

          <Card className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Тариф</h3>
              <Pill variant={isPro ? 'purple' : 'info'}>{isPro ? 'Pro' : 'Free'}</Pill>
            </div>
            <div className={styles.planRow}>
              {isPro ? (
                <>
                  <p className={styles.planText}>Ваш Pro-тариф активен.</p>
                  <Button
                    variant="ghost-sm"
                    onClick={() => toast.info('Управление подпиской появится позже')}
                  >
                    Управление подпиской
                  </Button>
                </>
              ) : (
                <>
                  <p className={styles.planText}>
                    Вы на бесплатном тарифе. 5 схем, без экспорта SQL.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => toast.info('Биллинг появится позже')}
                  >
                    Перейти на Pro
                  </Button>
                </>
              )}
            </div>
          </Card>

          <Card className={`${styles.section} ${styles.dangerCard}`}>
            <h3 className={styles.dangerTitle}>Опасная зона</h3>
            <div className={styles.dangerRow}>
              <div className={styles.dangerLabel}>Изменить пароль</div>
              <Button
                variant="ghost-sm"
                onClick={() => toast.info('Смена пароля появится позже')}
              >
                Изменить
              </Button>
            </div>
            <div className={styles.dangerRow}>
              <div className={styles.dangerLabel}>Удалить аккаунт</div>
              <Button
                variant="ghost-sm"
                danger
                onClick={() => toast.info('Удаление аккаунта появится позже')}
              >
                Удалить
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

interface SqlDialectSelectProps {
  value: SqlDialect;
  onChange: (value: SqlDialect) => void;
  disabled?: boolean;
}

function SqlDialectSelect({ value, onChange, disabled }: SqlDialectSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.selectWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.selectTrigger}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{value}</span>
        <Icon name="chevron-down" size={14} />
      </button>
      {open && (
        <div className={styles.selectMenu} role="menu">
          {SQL_DIALECTS.map((opt) => (
            <button
              key={opt}
              type="button"
              role="menuitem"
              className={`${styles.selectItem} ${opt === value ? styles.selectItemActive : ''}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <span className={styles.selectDot} />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
