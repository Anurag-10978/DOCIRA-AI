import { api } from './api';

export interface KnowledgeBase {
  id: number;
  name: string;
  description?: string;
  category?: string;
  icon: string;
  color: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  document_count: number;
  total_chunks: number;
}

export interface CreateKBPayload {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
}

export const knowledgeBaseAPI = {
  list: ()                              => api.get<KnowledgeBase[]>('/api/knowledge-bases/'),
  get:  (id: number)                    => api.get<KnowledgeBase>(`/api/knowledge-bases/${id}`),
  create: (data: CreateKBPayload)       => api.post<KnowledgeBase>('/api/knowledge-bases/', data),
  update: (id: number, data: Partial<CreateKBPayload>) => api.put<KnowledgeBase>(`/api/knowledge-bases/${id}`, data),
  delete: (id: number)                  => api.delete(`/api/knowledge-bases/${id}`),
};