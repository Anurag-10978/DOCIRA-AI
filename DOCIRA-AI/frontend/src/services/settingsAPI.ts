import { api } from './api';

export interface AISettings {
  llm_model: string;
  embedding_model: string;
  chunk_size: number;
  chunk_overlap: number;
  temperature: number;
  max_context_chunks: number;
}

export const settingsAPI = {
  getAI:    () => api.get<AISettings>('/api/settings/ai'),
  updateAI: (data: Partial<AISettings>) => api.put<AISettings>('/api/settings/ai', data),
  getModels:() => api.get<{ models: string[] }>('/api/settings/models'),
  pullModel:(model_name: string) => api.post('/api/settings/pull-model', { model_name }),
};