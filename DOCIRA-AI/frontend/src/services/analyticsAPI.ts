import { api } from './api';

export interface AnalyticsOverview {
  total_documents: number;
  total_knowledge_bases: number;
  total_queries: number;
  total_tokens_used: number;
  avg_response_time_ms: number;
  storage_used_mb: number;
  completed_documents: number;
  failed_documents: number;
  queries_today: number;
  queries_this_week: number;
}

export interface DailyQueryCount {
  date: string;
  count: number;
  qa: number;
  summarize: number;
  compare: number;
  extract: number;
  search: number;
}

export interface TaskTypeBreakdown {
  task_type: string;
  count: number;
  percentage: number;
}

export interface DocumentStatusStat {
  knowledge_base: string;
  completed: number;
  processing: number;
  failed: number;
  pending: number;
}

export interface TopDocument {
  document_id: number;
  title: string;
  filename: string;
  knowledge_base: string;
  query_count: number;
  chunk_count: number;
}

export interface StorageUsage {
  knowledge_base_id: number;
  knowledge_base_name: string;
  document_count: number;
  total_size_mb: number;
  chunk_count: number;
}

export const analyticsAPI = {
  overview:       () => api.get<AnalyticsOverview>('/api/analytics/overview'),
  dailyQueries:   (days = 30) => api.get<DailyQueryCount[]>(`/api/analytics/daily-queries?days=${days}`),
  taskBreakdown:  () => api.get<TaskTypeBreakdown[]>('/api/analytics/task-breakdown'),
  documentStatus: () => api.get<DocumentStatusStat[]>('/api/analytics/document-status'),
  topDocuments:   () => api.get<TopDocument[]>('/api/analytics/top-documents'),
  storage:        () => api.get<StorageUsage[]>('/api/analytics/storage'),
};