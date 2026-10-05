import { api } from './api';

export interface SearchResult {
  document_id: number;
  document_title: string;
  filename: string;
  file_type: string;
  page: number;
  snippet: string;
  similarity_score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  latency_ms: number;
}

export interface SearchHistoryItem {
  id: number;
  query_text: string;
  task_type: string;
  response_time_ms: number;
  created_at: string;
}

export const searchAPI = {
  semantic: (data: { query: string; knowledge_base_id: number; limit?: number }) =>
    api.post<SearchResponse>('/api/search/semantic', data),
  history: () =>
    api.get<SearchHistoryItem[]>('/api/search/history'),
  frequent: () =>
    api.get<{ query: string; count: number }[]>('/api/search/frequent'),
};