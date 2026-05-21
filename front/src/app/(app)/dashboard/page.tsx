'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Workspace } from '@/components/dashboard/Workspace';
import { fetchChats, fetchChat, createChat, sendMessage, renameChat, deleteChat, generateTitle } from '@/lib/api/chats';
import { createSchema, fetchSchema } from '@/lib/api/schemas';
import { getErrorBody, getErrorMessage, getStatus } from '@/lib/error';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import type { Chat, DashboardTab, Message, SqlDialect, TableNote } from '@/types';
import styles from './page.module.css';

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 60;
const DOCK_DEFAULT_HEIGHT = 200;
const DOCK_HEIGHT_STORAGE_KEY = 'er-db:dock-height';
const DOCK_MIN_HEIGHT = 140;

function readStoredDockHeight(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(DOCK_HEIGHT_STORAGE_KEY);
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--text-secondary)' }}>Загрузка…</div>}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const user = useAuthStore((s) => s.user);
  const defaultDialect = (user?.default_sql_dialect ?? 'PostgreSQL') as
    | 'PostgreSQL'
    | 'MySQL'
    | 'SQLite'
    | 'SQL Server'
    | 'Oracle';

  const router = useRouter();
  const searchParams = useSearchParams();
  const schemaParam = searchParams.get('schema');

  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<TableNote[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('diagram');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [dockHeight, setDockHeight] = useState(DOCK_DEFAULT_HEIGHT);
  // chatId, для которого нужно пропустить ближайший fetchChat
  // (используется когда мы вручную проставили synthetic-сообщение из schema).
  const skipNextFetchChat = useRef<string | null>(null);

  // Initial chats load. Если ?schema=<id> — открываем схему в новом чате.
  // Иначе — обычная логика (первый чат или создаём пустой).
  useEffect(() => {
    let cancelled = false;

    const loadChatsList = async () => {
      const list = await fetchChats();
      if (cancelled) return list;
      setChats(list);
      return list;
    };

    const openSchema = async (schemaId: string) => {
      const schema = await fetchSchema(schemaId);
      if (cancelled) return;
      // Создаём чат сразу с seed-сообщением — оно сохраняется в БД как
      // обычный assistant-Message, поэтому переживёт перезаход в чат.
      const chat = await createChat(schema.name, {
        content: `📂 Загружена схема «${schema.name}». Опишите изменения — я их применю.`,
        er_data: schema.er_data,
        sql: schema.sql,
      });
      if (cancelled) return;
      setChats((prev) => [
        {
          id: chat.id,
          title: chat.title,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          message_count: chat.messages.length,
        },
        ...prev,
      ]);
      // У созданного чата уже есть seed-сообщение в БД — берём messages
      // прямо из ответа, чтобы не делать лишний fetchChat-запрос.
      skipNextFetchChat.current = chat.id;
      setActiveChatId(chat.id);
      setMessages(chat.messages);
      toast.success(`Открыта схема «${schema.name}»`);
      // Чистим URL чтобы повторный открытий схемы не было при перезагрузке
      router.replace('/dashboard', { scroll: false });
    };

    const run = async () => {
      try {
        const list = await loadChatsList();
        if (cancelled) return;
        if (schemaParam) {
          await openSchema(schemaParam);
          return;
        }
        // Без schemaParam — выбираем первый чат или создаём
        if (list.length === 0) {
          const fresh = await createChat('Новый чат');
          if (cancelled) return;
          setChats([
            {
              id: fresh.id,
              title: fresh.title,
              created_at: fresh.created_at,
              updated_at: fresh.updated_at,
              message_count: 0,
            },
          ]);
          setActiveChatId(fresh.id);
        } else {
          setActiveChatId(list[0].id);
        }
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setChatsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaParam]);

  // Load chat detail (messages) when activeChatId changes.
  useEffect(() => {
    if (!activeChatId) return;
    if (skipNextFetchChat.current === activeChatId) {
      skipNextFetchChat.current = null;
      return;
    }
    let cancelled = false;
    fetchChat(activeChatId)
      .then((chat) => {
        if (cancelled) return;
        setMessages(chat.messages);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(getErrorMessage(err));
        setMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [activeChatId]);

  useEffect(() => {
    const stored = readStoredDockHeight();
    if (stored === null) return;
    const max = Math.floor(window.innerHeight * 0.5);
    const clamped = Math.min(Math.max(stored, DOCK_MIN_HEIGHT), max);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with external storage on mount
    setDockHeight(clamped);
  }, []);

  const handleDockHeightChange = useCallback((h: number) => {
    setDockHeight(h);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DOCK_HEIGHT_STORAGE_KEY, String(h));
    }
  }, []);

  const erData = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'assistant' && m.er_data) return m.er_data;
    }
    return { nodes: [], edges: [] };
  }, [messages]);

  const sql = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'assistant' && m.sql) return m.sql;
    }
    return '';
  }, [messages]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeChatId || sending) return;
      // Пока у чата дефолтное название — генерируем title по ПЕРВОМУ
      // юзерскому сообщению (а не последнему: иначе follow-up вроде
      // "добавь колонку" даст невнятное имя). Перегенерация повторяется,
      // пока не получится — после успеха title уже не "Новый чат".
      const chatIdForTitle = activeChatId;
      const hasDefaultTitle =
        chats.find((c) => c.id === chatIdForTitle)?.title === 'Новый чат';
      const existingFirstUserMessage = messages.find((m) => m.role === 'user');
      const titlePrompt = existingFirstUserMessage?.content ?? text;

      const userTempId = `temp-u-${Date.now()}`;
      const placeholderId = `temp-a-${Date.now()}`;
      const userMsg: Message = {
        id: userTempId,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      };
      const placeholder: Message = {
        id: placeholderId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg, placeholder]);
      setSending(true);
      try {
        const { user_message, assistant_message } = await sendMessage(
          activeChatId,
          text,
          defaultDialect,
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userTempId ? user_message : m.id === placeholderId ? assistant_message : m,
          ),
        );
        // Оптимистично бампим счётчик и updated_at, плюс поднимаем чат
        // наверх списка — чтобы не ждать перезагрузки страницы.
        const now = new Date().toISOString();
        setChats((prev) => {
          const updated = prev.map((c) =>
            c.id === chatIdForTitle
              ? { ...c, message_count: c.message_count + 2, updated_at: now }
              : c,
          );
          const target = updated.find((c) => c.id === chatIdForTitle);
          if (!target) return updated;
          return [target, ...updated.filter((c) => c.id !== chatIdForTitle)];
        });
        if (hasDefaultTitle) {
          generateTitle(chatIdForTitle, titlePrompt)
            .then(({ title }) => {
              setChats((prev) =>
                prev.map((c) => (c.id === chatIdForTitle ? { ...c, title } : c)),
              );
            })
            .catch(() => {
              // Молча игнорируем — название чата не критично для UX.
            });
        }
      } catch (err) {
        const errMsg = getErrorMessage(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId ? { ...m, content: '', error: errMsg } : m,
          ),
        );
        // Пользовательское сообщение всё равно сохранилось в БД до того,
        // как упал OpenAI-вызов — бампим счётчик на +1.
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatIdForTitle ? { ...c, message_count: c.message_count + 1 } : c,
          ),
        );
        toast.error('Не удалось получить ответ. Попробуйте снова.');
      } finally {
        setSending(false);
      }
    },
    [activeChatId, sending, defaultDialect, messages, chats],
  );

  // Reset notes when chat changes — заметки относятся к схеме, а не к чату.
  // Тут пока пусто; библиотека показывает notes для конкретной schema.
  useEffect(() => {
    setNotes([]);
  }, [activeChatId]);

  const handleRenameChat = useCallback(async (id: string, title: string) => {
    // Optimistic update
    const prev = chats;
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, title } : c)));
    try {
      await renameChat(id, title);
      toast.success('Чат переименован');
    } catch (err) {
      setChats(prev);
      toast.error(getErrorMessage(err));
    }
  }, [chats]);

  const handleDeleteChat = useCallback(async (id: string) => {
    const prev = chats;
    const wasActive = id === activeChatId;
    setChats((cs) => cs.filter((c) => c.id !== id));
    if (wasActive) {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      } else {
        setActiveChatId(null);
        setMessages([]);
      }
    }
    try {
      await deleteChat(id);
      toast.success('Чат удалён');
    } catch (err) {
      setChats(prev);
      if (wasActive) setActiveChatId(id);
      toast.error(getErrorMessage(err));
    }
  }, [chats, activeChatId]);

  const handleCreateChat = useCallback(async () => {
    if (creatingChat) return;
    setCreatingChat(true);
    try {
      const fresh = await createChat('Новый чат');
      setChats((prev) => [
        {
          id: fresh.id,
          title: fresh.title,
          created_at: fresh.created_at,
          updated_at: fresh.updated_at,
          message_count: 0,
        },
        ...prev,
      ]);
      // У нового чата на бэке 0 сообщений — пропустим fetchChat, очистим локально
      skipNextFetchChat.current = fresh.id;
      setMessages([]);
      setActiveChatId(fresh.id);
      setActiveTab('diagram');
      toast.success('Новый чат создан');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreatingChat(false);
    }
  }, [creatingChat]);

  const activeChatTitle = chats.find((c) => c.id === activeChatId)?.title ?? 'Новая схема';

  const handleSave = useCallback(
    async (dialect: SqlDialect) => {
      if (saving) return;
      if (erData.nodes.length === 0) {
        toast.info('Нечего сохранять — сначала сгенерируйте схему');
        return;
      }
      setSaving(true);
      try {
        const schema = await createSchema({
          name: activeChatTitle,
          description: '',
          er_data: erData,
          sql,
          sql_dialect: dialect,
        });
        toast.success('Схема сохранена в библиотеку');
        router.push(`/library/${schema.id}`);
      } catch (err) {
        const status = getStatus(err);
        const body = getErrorBody(err);
        if (status === 403 && body?.limit) {
          toast.error(`Лимит ${body.limit} схем на Free плане. Обновитесь до Pro.`);
        } else {
          toast.error(getErrorMessage(err));
        }
      } finally {
        setSaving(false);
      }
    },
    [saving, erData, sql, activeChatTitle, router],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((c) => !c);
        return;
      }
      if (e.key === 'Escape') {
        setSidebarCollapsed((c) => (c ? false : c));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const rootStyle = { '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties;

  // Skeleton при первичной загрузке
  if (chatsLoading) {
    return (
      <div className={styles.desktop} style={rootStyle}>
        <div style={{ padding: 24, color: 'var(--text-secondary)' }}>Загружаем чаты…</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.desktop} style={rootStyle}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId ?? ''}
          onSelectChat={setActiveChatId}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          onCreateChat={handleCreateChat}
          creatingChat={creatingChat}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />
        <Workspace
          erData={erData}
          sql={sql}
          notes={notes}
          messages={messages}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          generating={sending}
          dockHeight={dockHeight}
          onDockHeightChange={handleDockHeightChange}
          onSendMessage={handleSendMessage}
          onSave={handleSave}
          saving={saving}
        />
      </div>
      <MobileNotice />
    </>
  );
}

function MobileNotice() {
  return (
    <div className={styles.mobileNotice}>
      <Icon name="monitor" size={32} className={styles.mobileIcon} />
      <h3 className={styles.mobileTitle}>Откройте на компьютере</h3>
      <p className={styles.mobileHint}>
        Дашборд оптимизирован для большого экрана. На мобильных устройствах
        пока недоступен.
      </p>
      <Link href="/" className={styles.mobileLink}>
        На главную
      </Link>
    </div>
  );
}
