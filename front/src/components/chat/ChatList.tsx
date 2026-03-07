'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type { ChatListResponse } from '@/types';

interface ChatListProps {
  chats: ChatListResponse[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatList({
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
}: ChatListProps) {
  const [animatedChatId, setAnimatedChatId] = useState<string | null>(null);
  const prevChatsRef = useRef<ChatListResponse[]>(chats);

  useEffect(() => {
    // Находим чат, у которого изменился title
    const prevChats = prevChatsRef.current;
    for (const chat of chats) {
      const prevChat = prevChats.find(c => c.id === chat.id);
      if (prevChat && prevChat.title !== chat.title) {
        setAnimatedChatId(chat.id);
        const timer = setTimeout(() => setAnimatedChatId(null), 600);
        prevChatsRef.current = chats;
        return () => clearTimeout(timer);
      }
    }
    prevChatsRef.current = chats;
  }, [chats]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm">Нет чатов</p>
            <p className="text-xs mt-1">Создайте новый чат для начала</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  group flex items-center gap-2 p-3 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${
                    currentChatId === chat.id
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }
                `}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare
                  size={16}
                  className={
                    currentChatId === chat.id
                      ? 'text-cyan-400'
                      : 'text-zinc-500'
                  }
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`
                      text-sm truncate
                      transition-all duration-500 ease-out
                      ${currentChatId === chat.id ? 'text-white' : 'text-zinc-300'}
                      ${animatedChatId === chat.id
                        ? 'animate-title-change'
                        : ''
                      }
                    `}
                  >
                    {chat.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {chat.message_count} сообщений
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="
                    opacity-0 group-hover:opacity-100
                    p-1.5 rounded-md
                    text-zinc-500 hover:text-red-400
                    hover:bg-red-500/10
                    transition-all duration-200
                  "
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
