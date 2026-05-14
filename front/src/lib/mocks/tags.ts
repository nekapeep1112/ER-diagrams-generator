import type { Tag } from '@/types';

const COLORS = ['#06b6d4', '#a855f7', '#4ade80', '#facc15', '#f43f5e'];

const TAG_NAMES = [
  'billing', 'subscriptions', 'saas',
  'retail', 'cart', 'shop', 'orders', 'payments', 'auth',
  'blog', 'content', 'comments', 'tags',
  'education', 'courses', 'students',
  'social', 'feed', 'follows',
  'pos', 'staff',
  'healthcare', 'patients', 'appointments',
  'events', 'metrics', 'users',
  'forum', 'threads', 'karma',
  'inventory', 'stock', 'suppliers',
  'booking', 'calendar', 'resources',
  'crm', 'leads', 'deals', 'sales',
  'property', 'listings', 'agents',
  'iot', 'timeseries', 'devices',
  'music', 'playlists', 'artists',
  'tasks', 'projects', 'kanban',
];

export const MOCK_TAGS: Tag[] = TAG_NAMES.map((name, i) => ({
  id: `t-${name}`,
  name,
  color: COLORS[i % COLORS.length],
}));

const TAG_MAP: Record<string, Tag> = Object.fromEntries(
  MOCK_TAGS.map((t) => [t.name, t]),
);

export function tagsByNames(names: string[]): Tag[] {
  return names
    .map((n) => TAG_MAP[n])
    .filter((t): t is Tag => Boolean(t));
}
