import axios from 'axios';
import type {
  AuthResponse,
  ChatListResponse,
  ChatDetailResponse,
  SendMessageResponse,
  SavedSchema,
  Tag,
  User,
  SqlDialect,
  RegisterData,
  LoginData,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Нужен для передачи httpOnly cookie access_token между фронтом и бэком
  withCredentials: true,
});

// Request interceptor: если cookie нет (например, в dev через Authorization-fallback), берём токен из localStorage.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor для auth ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/' && window.location.pathname !== '/verify-email') {
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout/');
    } catch {
      // игнорируем — всё равно чистим локальное состояние
    }
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me/');
    return response.data;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/verify-email/', { token });
    return response.data;
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/resend-verification/', { email });
    return response.data;
  },
};

// Chats API
export const chatsApi = {
  getList: async (search?: string): Promise<ChatListResponse[]> => {
    const response = await api.get<ChatListResponse[]>('/chats/', {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  create: async (title?: string): Promise<ChatDetailResponse> => {
    const response = await api.post<ChatDetailResponse>('/chats/', {
      title: title || 'Новый чат',
    });
    return response.data;
  },

  getById: async (chatId: string): Promise<ChatDetailResponse> => {
    const response = await api.get<ChatDetailResponse>(`/chats/${chatId}/`);
    return response.data;
  },

  update: async (chatId: string, title: string): Promise<ChatDetailResponse> => {
    const response = await api.patch<ChatDetailResponse>(`/chats/${chatId}/`, {
      title,
    });
    return response.data;
  },

  delete: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}/`);
  },

  generateTitle: async (chatId: string, prompt: string): Promise<{ title: string; chat: ChatDetailResponse }> => {
    const response = await api.post<{ title: string; chat: ChatDetailResponse }>(
      `/chats/${chatId}/generate-title/`,
      { prompt }
    );
    return response.data;
  },
};

// Messages API
export const messagesApi = {
  send: async (chatId: string, content: string, sqlDialect?: SqlDialect): Promise<SendMessageResponse> => {
    const response = await api.post<SendMessageResponse>(
      `/chats/${chatId}/messages/`,
      { content, sql_dialect: sqlDialect || 'PostgreSQL' }
    );
    return response.data;
  },
};

// Saved Schemas API
export const schemasApi = {
  create: async (data: { name: string; er_data: object; sql: string; tag_ids?: string[] }): Promise<SavedSchema> => {
    const response = await api.post<SavedSchema>('/schemas/', data);
    return response.data;
  },

  list: async (params?: { search?: string; tags?: string[] }): Promise<SavedSchema[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.tags && params.tags.length > 0) queryParams.tags = params.tags.join(',');
    const response = await api.get<SavedSchema[]>('/schemas/', { params: queryParams });
    return response.data;
  },

  update: async (id: string, data: { name?: string; tag_ids?: string[] }): Promise<SavedSchema> => {
    const response = await api.patch<SavedSchema>(`/schemas/${id}/`, data);
    return response.data;
  },

  delete: async (schemaId: string): Promise<void> => {
    await api.delete(`/schemas/${schemaId}/`);
  },

  export: async (schemaId: string): Promise<Blob> => {
    const response = await api.get(`/schemas/${schemaId}/export/`, { responseType: 'blob' });
    return response.data as Blob;
  },
};

// Tags API
export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const response = await api.get<Tag[]>('/tags/');
    return response.data;
  },

  create: async (data: { name: string; color?: string }): Promise<Tag> => {
    const response = await api.post<Tag>('/tags/', data);
    return response.data;
  },

  delete: async (tagId: string): Promise<void> => {
    await api.delete(`/tags/${tagId}/`);
  },
};

export default api;
