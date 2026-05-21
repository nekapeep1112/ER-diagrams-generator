import { api, USE_MOCKS } from '../api';
import { MOCK_CHATS, MOCK_MESSAGES_BY_CHAT, BILLING_SAAS_ER_DATA, BILLING_SAAS_SQL } from '@/lib/mocks';
import type { Chat, ChatDetail, ERData, Message, MessageCreateResponse, SqlDialect } from '@/types';

export interface ChatSeedMessage {
  content: string;
  er_data?: ERData;
  sql?: string;
}

export async function fetchChats(search?: string): Promise<Chat[]> {
  if (USE_MOCKS) {
    let results = [...MOCK_CHATS];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((c) => c.title.toLowerCase().includes(q));
    }
    return results;
  }
  const { data } = await api.get('/chats/', { params: search ? { search } : {} });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export async function fetchChat(id: string): Promise<ChatDetail> {
  if (USE_MOCKS) {
    const chat = MOCK_CHATS.find((c) => c.id === id);
    if (!chat) throw new Error('Chat not found');
    const messages = MOCK_MESSAGES_BY_CHAT[id] ?? [];
    return { ...chat, messages };
  }
  const { data } = await api.get(`/chats/${id}/`);
  return data;
}

export async function createChat(
  title?: string,
  seedMessage?: ChatSeedMessage,
): Promise<ChatDetail> {
  if (USE_MOCKS) {
    const id = `mock-chat-${Date.now()}`;
    const now = new Date().toISOString();
    const messages: Message[] = seedMessage
      ? [
          {
            id: `mock-seed-${Date.now()}`,
            role: 'assistant',
            content: seedMessage.content,
            er_data: seedMessage.er_data ?? null,
            sql: seedMessage.sql ?? null,
            created_at: now,
          },
        ]
      : [];
    return {
      id,
      title: title ?? 'Новый чат',
      created_at: now,
      updated_at: now,
      message_count: messages.length,
      messages,
    };
  }
  const payload: { title: string; seed_message?: ChatSeedMessage } = {
    title: title ?? 'Новый чат',
  };
  if (seedMessage) payload.seed_message = seedMessage;
  const { data } = await api.post('/chats/', payload);
  return data;
}

export async function deleteChat(id: string): Promise<void> {
  if (USE_MOCKS) return;
  await api.delete(`/chats/${id}/`);
}

export async function renameChat(id: string, title: string): Promise<ChatDetail> {
  if (USE_MOCKS) {
    const chat = MOCK_CHATS.find((c) => c.id === id);
    if (!chat) throw new Error('Chat not found');
    return { ...chat, title, messages: MOCK_MESSAGES_BY_CHAT[id] ?? [] };
  }
  const { data } = await api.patch(`/chats/${id}/`, { title });
  return data;
}

export async function sendMessage(
  chatId: string,
  content: string,
  sqlDialect: SqlDialect = 'PostgreSQL',
): Promise<MessageCreateResponse> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 1200));
    const now = new Date().toISOString();
    const user_message: Message = {
      id: `mock-u-${Date.now()}`,
      role: 'user',
      content,
      created_at: now,
    };
    const assistant_message: Message = {
      id: `mock-a-${Date.now()}`,
      role: 'assistant',
      content: 'Готово. Сгенерировал ER-модель и SQL по вашему описанию (мок-режим).',
      er_data: BILLING_SAAS_ER_DATA,
      sql: BILLING_SAAS_SQL,
      created_at: now,
    };
    return { user_message, assistant_message };
  }
  const { data } = await api.post(
    `/chats/${chatId}/messages/`,
    { content, sql_dialect: sqlDialect },
    { timeout: 45000 },
  );
  return data;
}

export async function generateTitle(
  chatId: string,
  prompt: string,
): Promise<{ title: string; chat: ChatDetail }> {
  if (USE_MOCKS) {
    const trimmed = prompt.slice(0, 40).trim();
    const chat = MOCK_CHATS.find((c) => c.id === chatId);
    return {
      title: trimmed || 'Новый чат',
      chat: { ...(chat ?? MOCK_CHATS[0]), title: trimmed, messages: MOCK_MESSAGES_BY_CHAT[chatId] ?? [] },
    };
  }
  const { data } = await api.post(`/chats/${chatId}/generate-title/`, { prompt });
  return data;
}
