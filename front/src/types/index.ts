// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Column types for ER diagram
export interface Column {
  name: string;
  type: string;
  isPrimary: boolean;
  isForeign: boolean;
  references: string | null;
}

// ER Node types
export interface TableNodeData {
  tableName: string;
  columns: Column[];
}

export interface ERNode {
  id: string;
  type: 'tableNode';
  position: { x: number; y: number };
  data: TableNodeData;
}

// ER Edge types
export interface EREdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type: string;
  animated: boolean;
  label?: string;
}

// ER Data (from AI response)
export interface ERData {
  nodes: ERNode[];
  edges: EREdge[];
}

// SQL Dialect types
export type SqlDialect = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'SQL Server' | 'Oracle';

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  er_data: ERData | null;
  sql: string | null;
  created_at: string;
}

// Chat types
export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  messages?: Message[];
}

// API Response types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChatListResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatDetailResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
}

// Store types
export interface AppState {
  user: User | null;
  token: string | null;
  chats: ChatListResponse[];
  currentChat: ChatDetailResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setChats: (chats: ChatListResponse[]) => void;
  addChat: (chat: ChatListResponse) => void;
  removeChat: (chatId: string) => void;
  setCurrentChat: (chat: ChatDetailResponse | null) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  addMessage: (message: Message) => void;
  incrementMessageCount: (chatId: string, count?: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}
