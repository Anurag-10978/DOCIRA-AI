import { api } from './api';

export interface Conversation {
  id: number;
  title: string;
  knowledge_base_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message?: string;
}

export interface Citation {
  document_id: number;
  document_title: string;
  filename: string;
  page: number;
  snippet: string;
  similarity_score: number;
}

export interface AIMetadata {
  model: string;
  task_type: string;
  chunks_retrieved: number;
  tokens_used: number;
  latency_ms: number;
  embedding_model: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  ai_metadata?: AIMetadata;
  created_at: string;
}

export const chatAPI = {
  createConversation: (data: { title?: string; knowledge_base_id: number }) =>
    api.post<Conversation>('/api/chat/', data),
  listConversations: () =>
    api.get<Conversation[]>('/api/chat/'),
  deleteConversation: (id: number) =>
    api.delete(`/api/chat/${id}`),
  getMessages: (convId: number) =>
    api.get<Message[]>(`/api/chat/${convId}/messages`),
  sendMessage: (convId: number, payload: {
    content: string;
    document_ids?: number[];
    task_type?: string;
  }) => api.post<Message>(`/api/chat/${convId}/message`, payload),
};