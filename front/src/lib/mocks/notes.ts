import type { TableNote } from '@/types';

export const MOCK_NOTES: TableNote[] = [
  {
    id: 'note-1',
    type: 'idea',
    table_name: 'subscriptions',
    body: 'Добавить trial_ends_at для бесплатного периода. Возможно, отдельный enum-статус trialing.',
    created_at: '2026-05-12T14:08:00Z',
  },
  {
    id: 'note-2',
    type: 'warning',
    table_name: 'workspaces',
    body: 'Проверить уникальность name в рамках одного владельца. Сейчас уникальность глобальная — это создаст конфликт при импорте.',
    created_at: '2026-05-12T13:42:00Z',
  },
  {
    id: 'note-3',
    type: 'todo',
    table_name: undefined,
    body: 'Перед публикацией шаблона: добавить индекс на invoices.issued_at и описание в маркдауне.',
    created_at: '2026-05-12T11:15:00Z',
  },
];
