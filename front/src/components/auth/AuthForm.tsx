'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import type { AuthResponse } from '@/types';

interface AuthFormProps {
  onSuccess: (response: AuthResponse) => void;
}

type Tab = 'login' | 'register';

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.login(loginData);
      onSuccess(response);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; detail?: string } } };
      setError(
        axiosErr.response?.data?.error ||
        axiosErr.response?.data?.detail ||
        'Ошибка входа. Проверьте email и пароль.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.register(registerData);
      onSuccess(response);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: Record<string, string | string[]> };
      };
      const data = axiosErr.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(' ');
        setError(messages || 'Ошибка регистрации.');
      } else {
        setError('Ошибка регистрации.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white">ER Database Generator</h1>
          <p className="text-zinc-500 text-sm mt-1">Проектируй базы данных с AI</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          {/* Tabs */}
          <div className="flex mb-6 bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'login'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Войти
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'register'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Пароль</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Имя пользователя</label>
                <input
                  type="text"
                  required
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  placeholder="username"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Пароль</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Минимум 8 символов"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Повторите пароль</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={registerData.password_confirm}
                  onChange={(e) => setRegisterData({ ...registerData, password_confirm: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
