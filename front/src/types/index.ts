export interface User {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
  plan?: 'free' | 'pro';
  groups?: string[];
  is_email_verified?: boolean;
  bio?: string;
  default_sql_dialect?: SqlDialect;
}

export interface Column {
  name: string;
  type: string;
  isPrimary: boolean;
  isForeign: boolean;
  references: string | null;
}

export interface TableNodeData {
  tableName: string;
  columns: Column[];
  notesCount?: number;
}

export interface ERNode {
  id: string;
  type: 'tableNode';
  position: { x: number; y: number };
  data: TableNodeData;
}

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

export interface ERData {
  nodes: ERNode[];
  edges: EREdge[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  er_data?: ERData | null;
  sql?: string | null;
  created_at: string;
  error?: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatDetail extends Chat {
  messages: Message[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TableNote {
  id: string;
  table_name?: string;
  type: 'info' | 'warning' | 'idea' | 'todo';
  body: string;
  created_at: string;
  updated_at?: string;
}

export interface SavedSchema {
  id: string;
  name: string;
  description?: string;
  er_data: ERData;
  sql: string;
  sql_dialect: string;
  tags: Tag[];
  is_published: boolean;
  fork_count: number;
  notes: TableNote[];
  created_at: string;
  updated_at: string;
}

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  er_data: ERData;
  sql: string;
  tags: Tag[];
  author: User;
  fork_count: number;
  created_at: string;
  sql_dialect?: string;
  updated_at?: string;
  notes?: TableNote[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MessageCreateResponse {
  user_message: Message;
  assistant_message: Message;
}

export type SqlDialect = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'SQL Server' | 'Oracle';

export type DashboardTab = 'diagram' | 'sql' | 'notes';
