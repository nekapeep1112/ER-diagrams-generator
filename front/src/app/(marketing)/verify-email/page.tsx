'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { verifyEmail, resendVerification } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/error';
import styles from './page.module.css';

type View = 'waiting' | 'success' | 'error' | 'verifying';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [resending, setResending] = useState(false);
  const [view, setView] = useState<View>('waiting');

  const token = params.get('token');
  const errorParam = params.get('error');
  const email = params.get('email');

  useEffect(() => {
    if (!token) {
      setView(errorParam ? 'error' : 'waiting');
      return;
    }
    setView('verifying');
    verifyEmail(token)
      .then(({ user }) => {
        setUser(user);
        setView('success');
        toast.success('Email подтверждён');
      })
      .catch((err) => {
        setView('error');
        toast.error(getErrorMessage(err));
      });
  }, [token, errorParam, setUser]);

  const handleResend = async () => {
    if (!email) {
      toast.info('Email неизвестен — попробуйте зарегистрироваться заново');
      return;
    }
    setResending(true);
    try {
      await resendVerification(email);
      toast.success('Письмо отправлено повторно');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const handleResendNew = async () => {
    if (!email) {
      router.replace('/register');
      return;
    }
    setResending(true);
    try {
      await resendVerification(email);
      toast.success('Письмо отправлено повторно');
      router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  if (view === 'verifying') {
    return (
      <section className={styles.shell}>
        <div className={`${styles.iconCircle} ${styles.iconCircleCyan}`}>
          <Icon name="mail" size={48} strokeWidth={1.5} className={styles.iconCyan} />
        </div>
        <h1 className={styles.title}>Подтверждаем…</h1>
        <p className={styles.body}>Минутку, проверяем токен.</p>
      </section>
    );
  }

  if (view === 'success') {
    return (
      <section className={styles.shell}>
        <div className={`${styles.iconCircle} ${styles.iconCircleGreen}`}>
          <Icon name="check-circle" size={48} strokeWidth={1.5} className={styles.iconGreen} />
        </div>
        <h1 className={styles.title}>Email подтверждён</h1>
        <p className={styles.body}>Ваш аккаунт активирован. Переходим в кабинет.</p>
        <Button as="a" href="/dashboard" variant="primary" className={styles.fullBtn}>
          В кабинет →
        </Button>
      </section>
    );
  }

  if (view === 'error') {
    return (
      <section className={styles.shell}>
        <div className={`${styles.iconCircle} ${styles.iconCircleRed}`}>
          <Icon name="circle-alert" size={48} strokeWidth={1.5} className={styles.iconRed} />
        </div>
        <h1 className={styles.title}>Ссылка недействительна</h1>
        <p className={styles.body}>
          Срок действия ссылки истёк или она неверна. Запросите новое письмо.
        </p>
        <Button
          type="button"
          variant="primary"
          loading={resending}
          onClick={handleResendNew}
          className={styles.fullBtn}
        >
          Отправить новое письмо
        </Button>
      </section>
    );
  }

  return (
    <section className={styles.shell}>
      <div className={`${styles.iconCircle} ${styles.iconCircleCyan}`}>
        <Icon name="mail" size={48} strokeWidth={1.5} className={styles.iconCyan} />
      </div>
      <h1 className={styles.title}>Подтвердите почту</h1>
      <p className={styles.body}>
        {email ? (
          <>
            Мы отправили письмо со ссылкой на <strong className={styles.email}>{email}</strong>.
            Перейдите по ссылке чтобы подтвердить аккаунт.
          </>
        ) : (
          'Мы отправили письмо со ссылкой на ваш email.'
        )}
      </p>
      <div className={`${styles.hint} micro`}>Не получили? Проверьте спам.</div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" loading={resending} onClick={handleResend}>
          Отправить заново
        </Button>
        <Link href="/login" className={styles.smallLink}>
          Войти с другим аккаунтом
        </Link>
      </div>
    </section>
  );
}
