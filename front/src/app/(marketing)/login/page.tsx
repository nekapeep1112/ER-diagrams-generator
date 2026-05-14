'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { isEmail, isMinLength } from '@/lib/validate';
import { getErrorBody, getErrorMessage, getStatus } from '@/lib/error';
import styles from './page.module.css';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!isEmail(email)) next.email = 'Введите корректный email';
    if (!isMinLength(password, 4)) next.password = 'Минимум 4 символа';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Добро пожаловать, ${user.username}!`);
      const dest = searchParams?.get('next') || '/dashboard';
      router.push(dest);
    } catch (err) {
      const status = getStatus(err);
      const body = getErrorBody(err);
      if (status === 403 && body?.need_verification) {
        toast.info('Email не подтверждён. Откройте письмо.');
        router.push(`/verify-email?email=${encodeURIComponent(body.email ?? email)}`);
        return;
      }
      setLoading(false);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <section className={styles.shell}>
      <div className={styles.header}>
        <div className="micro">ВХОД В АККАУНТ</div>
        <h1 className={styles.title}>Войти в ER Database</h1>
        <p className={styles.subtitle}>Введите данные аккаунта для входа</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field label="ЭЛЕКТРОННАЯ ПОЧТА" error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            disabled={loading}
          />
        </Field>

        <Field
          label={
            <span className={styles.passwordLabelRow}>
              <span>ПАРОЛЬ</span>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => toast.info('Сброс пароля появится позже')}
              >
                Забыли пароль?
              </button>
            </span>
          }
          error={errors.password}
        >
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            disabled={loading}
          />
        </Field>

        <Button type="submit" variant="primary" size="md" loading={loading} className={styles.submit}>
          Войти
        </Button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>или</span>
        <span className={styles.dividerLine} />
      </div>

      <p className={styles.bottomLink}>
        Нет аккаунта?{' '}
        <Link href="/register" className={styles.cyanLink}>
          Зарегистрироваться →
        </Link>
      </p>
    </section>
  );
}
