'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

type Status = 'pending' | 'success' | 'error';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setToken, setUser } = useStore();

  const [status, setStatus] = useState<Status>('pending');
  const [message, setMessage] = useState('Проверяем ссылку...');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен не указан в ссылке');
      return;
    }

    const verify = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email подтверждён');
        if (response.token) setToken(response.token);
        if (response.user) setUser(response.user);
        setTimeout(() => router.push('/dashboard'), 1500);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } } };
        setStatus('error');
        setMessage(e.response?.data?.error || 'Не удалось подтвердить email');
      }
    };

    verify();
  }, [token, router, setToken, setUser]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendStatus(null);
    try {
      const r = await authApi.resendVerification(resendEmail);
      setResendStatus(r.message || 'Письмо отправлено');
    } catch {
      setResendStatus('Не удалось отправить письмо');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white">ER Database Generator</h1>
          <p className="text-zinc-500 text-sm mt-1">Подтверждение email</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          {status === 'pending' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
              <p className="text-zinc-300 text-sm">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="text-green-400" size={40} />
              <p className="text-white font-medium">{message}</p>
              <p className="text-zinc-500 text-xs">Перенаправляем в приложение...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <XCircle className="text-red-400" size={40} />
              <p className="text-white font-medium">{message}</p>

              <form onSubmit={handleResend} className="w-full mt-4 space-y-2">
                <label className="block text-left text-xs text-zinc-400">
                  Отправить новое письмо на:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/30"
                  >
                    <Mail size={16} />
                  </button>
                </div>
                {resendStatus && (
                  <p className="text-xs text-zinc-400 mt-1">{resendStatus}</p>
                )}
              </form>

              <button
                onClick={() => router.push('/')}
                className="mt-4 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Вернуться на главную
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
