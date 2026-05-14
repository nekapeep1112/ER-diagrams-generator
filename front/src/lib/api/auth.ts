import { api, USE_MOCKS } from '../api';
import { MOCK_USER } from '@/lib/mocks';
import type { User } from '@/types';

export interface LoginResponse {
  user: User;
}

export interface RegisterResponse {
  user: User;
  need_verification: boolean;
}

export interface VerifyEmailResponse {
  user: User;
  message: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCKS) {
    if (email !== MOCK_USER.email || password !== 'demo1234') {
      const err = new Error('Неверный email или пароль');
      (err as Error & { status?: number }).status = 401;
      throw err;
    }
    return { user: { ...MOCK_USER } };
  }
  const { data } = await api.post('/auth/login/', { email, password });
  return { user: data.user };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export async function register(payload: RegisterData): Promise<RegisterResponse> {
  if (USE_MOCKS) {
    return {
      user: { ...MOCK_USER, email: payload.email, username: payload.username, is_email_verified: false },
      need_verification: true,
    };
  }
  const { data } = await api.post('/auth/register/', payload);
  return { user: data.user, need_verification: data.need_verification ?? false };
}

export async function logout(): Promise<void> {
  if (USE_MOCKS) return;
  await api.post('/auth/logout/');
}

export async function getMe(): Promise<User> {
  if (USE_MOCKS) {
    return { ...MOCK_USER, bio: 'Frontend разработчик', default_sql_dialect: 'PostgreSQL' };
  }
  const { data } = await api.get('/auth/me/');
  return data;
}

export async function updateMe(patch: Partial<User>): Promise<User> {
  if (USE_MOCKS) return { ...MOCK_USER, ...patch };
  const { data } = await api.patch('/auth/me/', patch);
  return data;
}

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  if (USE_MOCKS) {
    return { user: { ...MOCK_USER, is_email_verified: true }, message: 'Email подтверждён' };
  }
  const { data } = await api.post('/auth/verify-email/', { token });
  return { user: data.user, message: data.message ?? 'Email подтверждён' };
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  if (USE_MOCKS) return { message: 'Письмо отправлено повторно.' };
  const { data } = await api.post('/auth/resend-verification/', { email });
  return { message: data.message };
}
