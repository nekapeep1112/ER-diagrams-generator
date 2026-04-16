'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/chat/Sidebar';
import ERCanvas from '@/components/er-diagram/ERCanvas';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthForm from '@/components/auth/AuthForm';
import { useStore } from '@/store/useStore';
import { authApi, chatsApi, messagesApi } from '@/lib/api';
import type { AuthResponse, ERData, SqlDialect } from '@/types';

export default function Home() {
  const {
    user,
    token,
    chats,
    currentChat,
    isLoading,
    setUser,
    setToken,
    setChats,
    addChat,
    removeChat,
    setCurrentChat,
    updateChatTitle,
    addMessage,
    incrementMessageCount,
    setLoading,
    logout,
  } = useStore();

  const [erData, setErData] = useState<ERData | null>(null);
  const [currentSql, setCurrentSql] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Initial auth check — restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setIsAuthLoading(false);
        return;
      }
      try {
        setToken(savedToken);
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, [setToken, setUser]);

  const handleAuthSuccess = (response: AuthResponse) => {
    setToken(response.token);
    setUser(response.user);
  };

  const handleLoadSchema = (schemaErData: ERData, sql: string) => {
    setErData(schemaErData);
    setCurrentSql(sql);
    setCurrentChat(null);
  };

  // Load chats when authenticated
  useEffect(() => {
    if (token && !isAuthLoading) {
      loadChats();
    }
  }, [token, isAuthLoading]);

  const loadChats = async () => {
    try {
      const chatsData = await chatsApi.getList();
      setChats(chatsData);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (!chatId) {
      setCurrentChat(null);
      setErData(null);
      setCurrentSql(null);
      return;
    }

    try {
      setLoading(true);
      const chat = await chatsApi.getById(chatId);
      setCurrentChat(chat);

      // Get the latest ER data from messages
      const lastMessageWithER = [...chat.messages]
        .reverse()
        .find((m) => m.er_data);
      if (lastMessageWithER?.er_data) {
        setErData(lastMessageWithER.er_data);
        setCurrentSql(lastMessageWithER.sql ?? null);
      } else {
        setErData(null);
        setCurrentSql(null);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      setLoading(true);
      const chat = await chatsApi.create();
      addChat({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        message_count: 0,
      });
      setCurrentChat(chat);
      setErData(null);
      setCurrentSql(null);
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await chatsApi.delete(chatId);
      removeChat(chatId);
      if (currentChat?.id === chatId) {
        setErData(null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleSendMessage = async (content: string, sqlDialect: SqlDialect) => {
    if (!currentChat) return;

    // Add user message immediately (optimistic update)
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: 'user' as const,
      content,
      er_data: null,
      sql: null,
      created_at: new Date().toISOString(),
    };
    addMessage(tempUserMessage);

    // Start loading
    setLoading(true);

    try {
      // Check if this is the first message in the chat
      const isFirstMessage = currentChat.messages.length === 0;

      if (isFirstMessage) {
        // Parallel: generate title + send message
        const [titleResponse, messageResponse] = await Promise.all([
          chatsApi.generateTitle(currentChat.id, content),
          messagesApi.send(currentChat.id, content, sqlDialect),
        ]);

        // Update chat title in store (for chat list)
        updateChatTitle(currentChat.id, titleResponse.title);

        // Increment message count (2 messages: user + assistant)
        incrementMessageCount(currentChat.id, 2);

        // Replace temp message with real messages AND update title in currentChat
        setCurrentChat({
          ...currentChat,
          title: titleResponse.title,
          messages: [
            messageResponse.user_message,
            messageResponse.assistant_message,
          ],
        });

        // Update ER data if present
        if (messageResponse.assistant_message.er_data) {
          setErData(messageResponse.assistant_message.er_data);
          setCurrentSql(messageResponse.assistant_message.sql ?? null);
        }
      } else {
        // Just send message
        const response = await messagesApi.send(currentChat.id, content, sqlDialect);

        // Increment message count (2 messages: user + assistant)
        incrementMessageCount(currentChat.id, 2);

        // Replace temp message with real messages
        setCurrentChat({
          ...currentChat,
          messages: [
            ...currentChat.messages.filter(m => m.id !== tempUserMessage.id),
            response.user_message,
            response.assistant_message,
          ],
        });

        // Update ER data if present
        if (response.assistant_message.er_data) {
          setErData(response.assistant_message.er_data);
          setCurrentSql(response.assistant_message.sql ?? null);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setCurrentChat({
        ...currentChat,
        messages: currentChat.messages.filter(m => m.id !== tempUserMessage.id),
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-zinc-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      {isSidebarVisible && (
        <Sidebar
          chats={chats}
          currentChat={currentChat}
          isLoading={isLoading}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
          onDeleteChat={handleDeleteChat}
          onSendMessage={handleSendMessage}
          onHideSidebar={() => setIsSidebarVisible(false)}
          onLoadSchema={handleLoadSchema}
        />
      )}

      {/* ER Canvas */}
      <ERCanvas
        erData={erData}
        currentSql={currentSql}
        user={user}
        onLogout={logout}
        isSidebarVisible={isSidebarVisible}
        onOpenSidebar={() => setIsSidebarVisible(true)}
      />
    </div>
  );
}
