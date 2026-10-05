import { api } from './api';

export interface AIFeatureResult {
  content: string;
  citations: any[];
  metadata: any;
}

export interface SummaryResult extends AIFeatureResult {
  summary_type: string;
  document_titles: string[];
}

export interface CompareResult extends AIFeatureResult {
  doc_a: { id: number; title: string; filename: string };
  doc_b: { id: number; title: string; filename: string };
}

export interface ExtractResult extends AIFeatureResult {
  extraction_type: string;
}

export const aiFeatureAPI = {
  summarize: (data: {
    knowledge_base_id: number;
    document_ids: number[];
    summary_type: string;
  }) => api.post<SummaryResult>('/api/ai/summarize', data),

  compare: (data: {
    knowledge_base_id: number;
    document_a_id: number;
    document_b_id: number;
    focus?: string;
  }) => api.post<CompareResult>('/api/ai/compare', data),

  extract: (data: {
    knowledge_base_id: number;
    document_ids: number[];
    extraction_type: string;
  }) => api.post<ExtractResult>('/api/ai/extract', data),
};