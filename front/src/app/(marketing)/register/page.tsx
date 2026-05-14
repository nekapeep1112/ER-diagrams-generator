'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { isEmail, isMinLength, matches } from '@/lib/validate';
import { getErrorBody, getErrorMessage } from '@/lib/error';
import styles from './page.module.css';

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  terms?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!isMinLength(username, 3)) next.username = 'Минимум 3 символа';
    if (!isEmail(email)) next.email = 'Введите корректный email';
    if (!isMinLength(password, 8)) next.password = 'Минимум 8 символов';
    if (!matches(password, passwordConfirm)) next.passwordConfirm = 'Пароли не совпадают';
    if (!terms) next.terms = 'Подтвердите согласие с условиями';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await register({ username, email, password, password_confirm: passwordConfirm });
      router.push('/verify-email?email=' + encodeURIComponent(email));
    } catch (err) {
      setLoading(false);
      const body = getErrorBody(err);
      if (body) {
        const fieldErrors: FieldErrors = {};
        if (Array.isArray(body.email)) fieldErrors.email = body.email[0];
        if (Array.isArray(body.username)) fieldErrors.username = (body.username as string[])[0];
        if (Array.isArray(body.password)) fieldErrors.password = (body.password as string[])[0];
        if (Array.isArray(body.password_confirm)) fieldErrors.passwordConfirm = (body.password_confirm as string[])[0];
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          return;
        }
      }
      toast.error(getErrorMessage(err));
    }
  };

  const stopLinkPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info('Документ появится позже');
  };

  return (
    <section className={styles.shell}>
      <div className={styles.header}>
        <div className="micro">РЕГИСТРАЦИЯ</div>
        <h1 className={styles.title}>Создайте аккаунт</h1>
        <p className={styles.subtitle}>Бесплатно навсегда — 5 схем. Pro снимает лимит.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field label="ИМЯ ПОЛЬЗОВАТЕЛЯ" error={errors.username}>
          <Input
            type="text"
            autoComplete="username"
            placeholder="Маша Коровина"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!errors.username}
            disabled={loading}
          />
        </Field>

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

        <Field label="ПАРОЛЬ" hint="Минимум 8 символов" error={errors.password}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            disabled={loading}
          />
        </Field>

        <Field label="ПОДТВЕРДИТЕ ПАРОЛЬ" error={errors.passwordConfirm}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            error={!!errors.passwordConfirm}
            disabled={loading}
          />
        </Field>

        <div className={styles.termsRow}>
          <Checkbox checked={terms} onChange={setTerms}>
            Я соглашаюсь с{' '}
            <a href="#" onClick={stopLinkPropagation}>условиями</a>
            {' '}и{' '}
            <a href="#" onClick={stopLinkPropagation}>политикой конфиденциальности</a>
          </Checkbox>
          {errors.terms && <div className={styles.termsError}>{errors.terms}</div>}
        </div>

        <Button type="submit" variant="primary" size="md" loading={loading} className={styles.submit}>
          Создать аккаунт
        </Button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>или</span>
        <span className={styles.dividerLine} />
      </div>

      <p className={styles.bottomLink}>
        Уже есть аккаунт?{' '}
        <Link href="/login" className={styles.cyanLink}>
          Войти →
        </Link>
      </p>
    </section>
  );
}
