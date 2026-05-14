import type { Chat, Message } from '@/types';
import { BILLING_SAAS_ER_DATA, BILLING_SAAS_SQL } from './templates';

export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    title: 'Биллинг SaaS · подписки и инвойсы',
    created_at: '2026-05-12T12:00:00Z',
    updated_at: '2026-05-12T15:30:00Z',
    message_count: 8,
  },
  {
    id: 'chat-2',
    title: 'Интернет-магазин с корзиной',
    created_at: '2026-05-11T10:00:00Z',
    updated_at: '2026-05-11T18:00:00Z',
    message_count: 14,
  },
  {
    id: 'chat-3',
    title: 'Блог с тегами и комментариями',
    created_at: '2026-05-09T10:00:00Z',
    updated_at: '2026-05-09T11:30:00Z',
    message_count: 5,
  },
  {
    id: 'chat-4',
    title: 'Курсы и прогресс студентов',
    created_at: '2026-05-04T10:00:00Z',
    updated_at: '2026-05-04T16:00:00Z',
    message_count: 21,
  },
  {
    id: 'chat-5',
    title: 'CRM: лиды и сделки',
    created_at: '2026-04-14T10:00:00Z',
    updated_at: '2026-04-14T15:00:00Z',
    message_count: 11,
  },
  {
    id: 'chat-6',
    title: 'Логистика складов',
    created_at: '2026-04-09T10:00:00Z',
    updated_at: '2026-04-09T10:45:00Z',
    message_count: 3,
  },
  {
    id: 'chat-7',
    title: 'Соц. сеть: посты и подписки',
    created_at: '2026-04-02T10:00:00Z',
    updated_at: '2026-04-02T17:00:00Z',
    message_count: 19,
  },
  {
    id: 'chat-8',
    title: 'Подкасты и эпизоды',
    created_at: '2026-04-15T10:00:00Z',
    updated_at: '2026-04-15T12:30:00Z',
    message_count: 6,
  },
];

export const MOCK_MESSAGES_BY_CHAT: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'm-1-1',
      role: 'user',
      content:
        'Биллинг для SaaS: workspace имеет много пользователей, у workspace одна подписка, инвойсы ссылаются на подписку, позиции инвойса — на инвойс.',
      created_at: '2026-05-12T12:00:00Z',
    },
    {
      id: 'm-1-2',
      role: 'assistant',
      content:
        'Создал 5 таблиц: workspaces, users, subscriptions, invoices, line_items. Все связи через UUID с каскадным удалением где уместно.',
      created_at: '2026-05-12T12:01:00Z',
    },
    {
      id: 'm-1-3',
      role: 'user',
      content: 'Сделай email уникальным и добавь индекс по workspace_id в users.',
      created_at: '2026-05-12T12:05:00Z',
    },
    {
      id: 'm-1-4',
      role: 'assistant',
      content: 'Добавил UNIQUE на users.email и INDEX idx_users_workspace.',
      created_at: '2026-05-12T12:06:00Z',
    },
    {
      id: 'm-1-5',
      role: 'user',
      content: 'У invoices добавь enum-статус: draft, open, paid, void.',
      created_at: '2026-05-12T12:15:00Z',
    },
    {
      id: 'm-1-6',
      role: 'assistant',
      content: "Создал enum invoice_status и колонку invoices.status с дефолтом 'draft'.",
      created_at: '2026-05-12T12:16:00Z',
    },
    {
      id: 'm-1-7',
      role: 'user',
      content: 'Добавь поле trial_ends_at в subscriptions и enum-статус trialing.',
      created_at: '2026-05-12T15:25:00Z',
    },
    {
      id: 'm-1-8',
      role: 'assistant',
      content:
        "Готово. Добавил subscriptions.trial_ends_at TIMESTAMPTZ NULL и расширил enum subscription_status значением 'trialing'.",
      er_data: BILLING_SAAS_ER_DATA,
      sql: BILLING_SAAS_SQL,
      created_at: '2026-05-12T15:30:00Z',
    },
  ],
  'chat-2': [],
  'chat-3': [],
  'chat-4': [],
  'chat-5': [],
  'chat-6': [],
  'chat-7': [],
  'chat-8': [],
};
