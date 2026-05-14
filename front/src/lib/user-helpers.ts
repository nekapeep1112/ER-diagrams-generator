import type { User } from '@/types';

export function getUserPlan(user: User | null | undefined): 'free' | 'pro' {
  if (!user) return 'free';
  if (user.plan) return user.plan;
  return user.groups?.includes('pro_user') ? 'pro' : 'free';
}

export function isPro(user: User | null | undefined): boolean {
  return getUserPlan(user) === 'pro';
}
