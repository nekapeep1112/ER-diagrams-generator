import { create } from 'zustand';
import type {
  AppState,
  User,
  ChatListResponse,
  ChatDetailResponse,
  Message,
} from '@/types';
import { authApi } from '@/lib/api';

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,

  setUser: (user: User | null) => set({ user }),

  setToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setChats: (chats: ChatListResponse[]) => set({ chats }),

  addChat: (chat: ChatListResponse) =>
    set((state) => ({
      chats: [chat, ...state.chats],
    })),

  removeChat: (chatId: string) =>
    set((state) => ({
      chats: state.chats.filter((c) => c.id !== chatId),
      currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
    })),

  setCurrentChat: (chat: ChatDetailResponse | null) => set({ currentChat: chat }),

  updateChatTitle: (chatId: string, title: string) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, title } : c
      ),
      currentChat:
        state.currentChat?.id === chatId
          ? { ...state.currentChat, title }
          : state.currentChat,
    })),

  addMessage: (message: Message) =>
    set((state) => {
      if (!state.currentChat) return state;
      return {
        currentChat: {
          ...state.currentChat,
          messages: [...state.currentChat.messages, message],
        },
      };
    }),

  incrementMessageCount: (chatId: string, count: number = 2) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? { ...c, message_count: (c.message_count || 0) + count }
          : c
      ),
    })),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  logout: async () => {
    await authApi.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      chats: [],
      currentChat: null,
      error: null,
    });
  },
}));
