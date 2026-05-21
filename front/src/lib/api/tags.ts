import { api, USE_MOCKS } from '../api';
import { MOCK_TAGS } from '@/lib/mocks';
import type { Tag } from '@/types';

export async function fetchTags(): Promise<Tag[]> {
  if (USE_MOCKS) return [...MOCK_TAGS];
  const { data } = await api.get('/tags/');
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  if (USE_MOCKS) {
    return {
      id: `mock-tag-${Date.now()}`,
      name,
      color: color ?? '#8b5cf6',
    };
  }
  const { data } = await api.post('/tags/', {
    name,
    color: color ?? '#8b5cf6',
  });
  return data;
}
