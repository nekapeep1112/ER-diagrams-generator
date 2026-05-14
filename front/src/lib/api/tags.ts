import { api, USE_MOCKS } from '../api';
import { MOCK_TAGS } from '@/lib/mocks';
import type { Tag } from '@/types';

export async function fetchTags(): Promise<Tag[]> {
  if (USE_MOCKS) return [...MOCK_TAGS];
  const { data } = await api.get('/tags/');
  return Array.isArray(data) ? data : (data?.results ?? []);
}
