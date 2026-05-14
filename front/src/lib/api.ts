import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const PUBLIC_PREFIXES = ['/templates'];
const PUBLIC_EXACT = new Set(['/', '/pricing', '/login', '/register', '/verify-email']);

function isPublicPath(path: string): boolean {
  if (PUBLIC_EXACT.has(path)) return true;
  return PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);
    const status = error?.response?.status;
    if (status !== 401) return Promise.reject(error);

    const path = window.location.pathname;
    if (isPublicPath(path)) return Promise.reject(error);
    if (path === '/login') return Promise.reject(error);

    const next = encodeURIComponent(path + window.location.search);
    window.location.href = `/login?next=${next}`;
    return Promise.reject(error);
  },
);
