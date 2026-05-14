import type { User } from '@/types';

export const MOCK_USER: User = {
  id: 1,
  email: 'm.korovina@uni.ru',
  username: 'Маша Коровина',
  avatar_url: undefined,
  plan: 'free',
  groups: ['free_user'],
  is_email_verified: true,
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
