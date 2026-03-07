'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, X, ChevronLeft, Plus } from 'lucide-react';
import ChatList from './ChatList';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import type { ChatListResponse, ChatDetailResponse, SqlDialect } from '@/types';

interface SidebarProps {
  chats: ChatListResponse[];
  currentChat: ChatDetailResponse | null;
  isLoading: boolean;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onSendMessage: (message: string, sqlDialect: SqlDialect) => void;
  onHideSidebar: () => void;
}

export default function Sidebar({
  chats,
  currentChat,
  isLoading,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onSendMessage,
  onHideSidebar,
}: SidebarProps) {
  const [width, setWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    if (newWidth >= 480 && newWidth <= 900) {
      setWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <aside
      ref={sidebarRef}
      className="h-full flex flex-col bg-[#0d0d14] border-r border-[#1e1e2e] relative overflow-hidden"
      style={{ width: `${width}px`, userSelect: 'none' }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

      {/* Chat list (when no chat selected) */}
      {!currentChat && (
        <ChatList
          chats={chats}
          currentChatId={null}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
        />
      )}

      {/* Current chat view */}
      {currentChat && (
        <>
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-[#1e1e2e] flex items-center gap-2">
            <button
              onClick={() => onSelectChat('')}
              className="p-1.5 rounded-md text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors shrink-0"
              title="К списку чатов"
            >
              <ChevronLeft size={18} />
            </button>
            <h2
              key={currentChat.title}
              className="text-white font-medium truncate flex-1 text-center animate-title-change"
            >
              {currentChat.title}
            </h2>
            <button
              onClick={onHideSidebar}
              className="p-1.5 rounded-md text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors shrink-0"
              title="Скрыть панель"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <MessageList
            messages={currentChat.messages}
            isLoading={isLoading}
          />

          {/* Input */}
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
          />
        </>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          absolute top-0 right-0 w-1 h-full cursor-col-resize
          bg-transparent hover:bg-cyan-500/20
          transition-colors duration-200
          ${isResizing ? 'bg-cyan-500/30' : ''}
        `}
      >
        <GripVertical
          size={16}
          className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 text-zinc-600"
        />
      </div>

      {/* Floating new chat button */}
      {!currentChat && (
        <button
          onClick={onCreateChat}
          disabled={isLoading}
          className="
            absolute bottom-6 right-6 z-10
            w-10 h-10 rounded-full
            bg-cyan-500/20 border border-cyan-500/30
            text-cyan-400
            hover:bg-cyan-500/30 hover:border-cyan-400/50
            hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]
            active:scale-95
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center
          "
          title="Новый чат"
        >
          <Plus size={20} />
        </button>
      )}
    </aside>
  );
}
