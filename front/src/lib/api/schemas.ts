import { api, USE_MOCKS } from '../api';
import { MOCK_SAVED_SCHEMAS } from '@/lib/mocks';
import type { ERData, SavedSchema, SchemaTemplate } from '@/types';

export interface FetchSchemasParams {
  search?: string;
  tags?: string[];
}

export async function fetchSchemas(params: FetchSchemasParams = {}): Promise<SavedSchema[]> {
  if (USE_MOCKS) {
    let results = [...MOCK_SAVED_SCHEMAS];
    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q) ||
          s.sql.toLowerCase().includes(q),
      );
    }
    if (params.tags?.length) {
      const wanted = new Set(params.tags);
      results = results.filter((s) => s.tags.some((t) => wanted.has(t.id)));
    }
    return results;
  }

  // Bust browser cache (бэк ставит Cache-Control: max-age=300 на /schemas/).
  // Серверная LocMem-кэш версионируется по user — повторные запросы дешёвые.
  const qs: Record<string, string | number> = { _t: Date.now() };
  if (params.search) qs.search = params.search;
  if (params.tags?.length) qs.tags = params.tags.join(',');

  const { data } = await api.get('/schemas/', { params: qs });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) {
    let acc: SavedSchema[] = [...data.results];
    let next: string | null = data.next;
    while (next) {
      const resp = await api.get(next);
      acc = acc.concat(resp.data.results ?? []);
      next = resp.data.next ?? null;
    }
    return acc;
  }
  return [];
}

export async function fetchSchema(id: string): Promise<SavedSchema> {
  if (USE_MOCKS) {
    const found = MOCK_SAVED_SCHEMAS.find((s) => s.id === id);
    if (!found) throw new Error('Schema not found');
    return found;
  }
  // Backend SavedSchemaDetailView не имеет GET — приходится через LIST + filter.
  // LIST возвращает полный SavedSchemaSerializer (все поля включая er_data, sql, notes).
  const all = await fetchSchemas();
  const found = all.find((s) => s.id === id);
  if (!found) {
    const err = new Error('Schema not found');
    (err as Error & { status?: number }).status = 404;
    throw err;
  }
  return found;
}

export interface CreateSchemaPayload {
  name: string;
  description?: string;
  er_data: ERData;
  sql: string;
  sql_dialect: string;
  tag_ids?: string[];
}

export async function createSchema(payload: CreateSchemaPayload): Promise<SavedSchema> {
  if (USE_MOCKS) {
    return {
      id: `new-${Date.now()}`,
      name: payload.name,
      description: payload.description ?? '',
      er_data: payload.er_data,
      sql: payload.sql,
      sql_dialect: payload.sql_dialect,
      tags: [],
      is_published: false,
      fork_count: 0,
      notes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/schemas/', payload);
  return data;
}

export interface UpdateSchemaPayload {
  name?: string;
  tag_ids?: string[];
}

export async function updateSchema(id: string, patch: UpdateSchemaPayload): Promise<SavedSchema> {
  if (USE_MOCKS) {
    const found = MOCK_SAVED_SCHEMAS.find((s) => s.id === id);
    if (!found) throw new Error('Schema not found');
    return { ...found, ...(patch.name ? { name: patch.name } : {}), updated_at: new Date().toISOString() };
  }
  const { data } = await api.patch(`/schemas/${id}/`, patch);
  return data;
}

export async function deleteSchema(id: string): Promise<void> {
  if (USE_MOCKS) return;
  await api.delete(`/schemas/${id}/`);
}

export interface PublishSchemaPayload {
  name?: string;
  description?: string;
  category: string;
}

export async function publishSchema(
  id: string,
  payload: PublishSchemaPayload,
): Promise<SchemaTemplate> {
  if (USE_MOCKS) {
    const schema = MOCK_SAVED_SCHEMAS.find((s) => s.id === id);
    if (!schema) throw new Error('Schema not found');
    return {
      id: `tpl-${Date.now()}`,
      name: payload.name ?? schema.name,
      description: payload.description ?? schema.description ?? '',
      category: payload.category,
      er_data: schema.er_data,
      sql: schema.sql,
      sql_dialect: schema.sql_dialect,
      tags: schema.tags,
      author: { id: 1, email: 'mock@mock', username: 'mock', plan: 'pro' },
      fork_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: [],
    };
  }
  const { data } = await api.post(`/schemas/${id}/publish/`, payload);
  return data;
}

export async function unpublishSchema(id: string): Promise<void> {
  if (USE_MOCKS) return;
  await api.delete(`/schemas/${id}/publish/`);
}

export async function exportSql(id: string, filename?: string): Promise<void> {
  if (USE_MOCKS) {
    const schema = MOCK_SAVED_SCHEMAS.find((s) => s.id === id);
    if (!schema) throw new Error('Schema not found');
    const blob = new Blob([schema.sql], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, filename ?? `${schema.name || 'schema'}.sql`);
    return;
  }
  const response = await api.get(`/schemas/${id}/export/`, { responseType: 'blob' });
  triggerDownload(response.data as Blob, filename ?? `schema-${id}.sql`);
}

function triggerDownload(blob: Blob, filename: string) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
