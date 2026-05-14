import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import * as authApi from '@/lib/api/auth';
import { getStatus, getErrorBody } from '@/lib/error';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: authApi.RegisterData) => Promise<{ need_verification: boolean; email: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateProfile: (patch: Partial<User>) => Promise<User>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user } = await authApi.login(email, password);
          set({ user, isLoading: false, isInitialized: true });
          return user;
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { need_verification } = await authApi.register(data);
          set({ isLoading: false });
          return { need_verification, email: data.email };
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore — мы всё равно очищаем локальный state
        }
        set({ user: null });
      },

      fetchMe: async () => {
        try {
          const user = await authApi.getMe();
          set({ user, isInitialized: true });
        } catch (e) {
          const status = getStatus(e);
          if (status === 401 || status === 403) {
            set({ user: null, isInitialized: true });
            return;
          }
          set({ isInitialized: true });
        }
      },

      updateProfile: async (patch) => {
        const user = await authApi.updateMe(patch);
        set({ user });
        return user;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export { getErrorBody };
