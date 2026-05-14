import { api, USE_MOCKS } from '../api';
import { MOCK_TEMPLATES } from '@/lib/mocks';
import type { PaginatedResponse, SavedSchema, SchemaTemplate, TableNote } from '@/types';

const PAGE_SIZE = 12;

export interface FetchTemplatesParams {
  search?: string;
  category?: string;
  tags?: string[];
  sort?: 'popular' | 'recent' | 'name';
  page?: number;
}

export async function fetchTemplates(
  params: FetchTemplatesParams = {},
): Promise<PaginatedResponse<SchemaTemplate>> {
  if (USE_MOCKS) {
    let results = [...MOCK_TEMPLATES];
    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (params.category) {
      results = results.filter((t) => t.category === params.category);
    }
    if (params.tags?.length) {
      const wanted = new Set(params.tags);
      results = results.filter((t) => t.tags.some((tag) => wanted.has(tag.id)));
    }
    if (params.sort === 'recent') {
      results.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (params.sort === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      results.sort((a, b) => b.fork_count - a.fork_count);
    }
    const page = params.page ?? 1;
    const start = (page - 1) * PAGE_SIZE;
    const slice = results.slice(start, start + PAGE_SIZE);
    return {
      count: results.length,
      next: start + PAGE_SIZE < results.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: slice,
    };
  }

  const qs: Record<string, string | number> = {};
  if (params.search) qs.q = params.search;
  if (params.category) qs.category = params.category;
  if (params.tags?.length) qs.tags = params.tags.join(',');
  if (params.sort) qs.sort = params.sort;
  if (params.page) qs.page = params.page;

  const { data } = await api.get('/templates/', { params: qs });
  return data;
}

export async function fetchTemplate(id: string): Promise<SchemaTemplate> {
  if (USE_MOCKS) {
    const found = MOCK_TEMPLATES.find((t) => t.id === id);
    if (!found) throw new Error('Template not found');
    return { ...found, notes: [] as TableNote[] };
  }
  const { data } = await api.get(`/templates/${id}/`);
  return data;
}

export async function forkTemplate(id: string): Promise<SavedSchema> {
  if (USE_MOCKS) {
    const tpl = MOCK_TEMPLATES.find((t) => t.id === id);
    if (!tpl) throw new Error('Template not found');
    return {
      id: `forked-${Date.now()}`,
      name: `${tpl.name} (форк)`,
      description: tpl.description,
      er_data: tpl.er_data,
      sql: tpl.sql,
      sql_dialect: tpl.sql_dialect ?? 'PostgreSQL',
      tags: tpl.tags,
      is_published: false,
      fork_count: 0,
      notes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  const { data } = await api.post(`/templates/${id}/fork/`);
  return data;
}
