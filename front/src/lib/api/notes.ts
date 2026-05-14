import { api, USE_MOCKS } from '../api';
import { MOCK_NOTES } from '@/lib/mocks';
import type { TableNote } from '@/types';

export type NoteType = TableNote['type'];

export interface CreateNotePayload {
  type: NoteType;
  table_name?: string;
  body: string;
}

export async function fetchNotes(schemaId: string): Promise<TableNote[]> {
  if (USE_MOCKS) return [...MOCK_NOTES];
  const { data } = await api.get(`/schemas/${schemaId}/notes/`);
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function createNote(schemaId: string, payload: CreateNotePayload): Promise<TableNote> {
  if (USE_MOCKS) {
    return {
      id: `note-${Date.now()}`,
      type: payload.type,
      table_name: payload.table_name,
      body: payload.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  const { data } = await api.post(`/schemas/${schemaId}/notes/`, payload);
  return data;
}

export async function updateNote(noteId: string, patch: Partial<CreateNotePayload>): Promise<TableNote> {
  if (USE_MOCKS) {
    const found = MOCK_NOTES.find((n) => n.id === noteId);
    if (!found) throw new Error('Note not found');
    return { ...found, ...patch, updated_at: new Date().toISOString() };
  }
  const { data } = await api.patch(`/notes/${noteId}/`, patch);
  return data;
}

export async function deleteNote(noteId: string): Promise<void> {
  if (USE_MOCKS) return;
  await api.delete(`/notes/${noteId}/`);
}
