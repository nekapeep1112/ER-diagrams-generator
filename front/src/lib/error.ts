import axios from 'axios';

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (typeof data.detail === 'string') return data.detail;
      if (typeof data.error === 'string') return data.error;
      if (typeof data.message === 'string') return data.message;
      const firstFieldError = Object.values(data).find(
        (v): v is string[] => Array.isArray(v) && typeof v[0] === 'string',
      );
      if (firstFieldError) return firstFieldError[0];
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так';
}

export interface ApiErrorBody {
  error?: string;
  detail?: string;
  limit?: number;
  current?: number;
  need_verification?: boolean;
  email?: string;
  template_id?: string;
  [key: string]: unknown;
}

export function getErrorBody(err: unknown): ApiErrorBody | null {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object') return data as ApiErrorBody;
  }
  return null;
}

export function getStatus(err: unknown): number | null {
  if (axios.isAxiosError(err)) return err.response?.status ?? null;
  return null;
}
