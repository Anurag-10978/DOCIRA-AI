import { api } from './api';

export interface Document {
  id: number;
  title: string;
  filename: string;
  file_size: number;
  file_type: string;
  num_pages: number;
  tags: string[];
  category?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  knowledge_base_id: number;
  uploaded_by: number;
  created_at: string;
  processed_at?: string;
  chunk_count: number;
  processing_logs: string[];
  error_message?: string;
}

export interface UploadPayload {
  file: File;
  knowledge_base_id: number;
  title?: string;
  tags?: string[];
  category?: string;
}

export interface ProcessingLogsResponse {
  doc_id: number;
  status: string;
  logs: string[];
  chunk_count: number;
  processed_at?: string;
  error_message?: string;
}

export const documentAPI = {
  upload: (payload: UploadPayload, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', payload.file);
    form.append('knowledge_base_id', String(payload.knowledge_base_id));
    if (payload.title)    form.append('title', payload.title);
    if (payload.tags)     form.append('tags', JSON.stringify(payload.tags));
    if (payload.category) form.append('category', payload.category);

    return api.post<Document>('/api/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
  },

  list:      (kb_id: number)  => api.get<Document[]>(`/api/documents/?kb_id=${kb_id}`),
  get:       (id: number)     => api.get<Document>(`/api/documents/${id}`),
  delete:    (id: number)     => api.delete(`/api/documents/${id}`),
  reprocess: (id: number)     => api.post<Document>(`/api/documents/${id}/reprocess`),
  getLogs:   (id: number)     => api.get<ProcessingLogsResponse>(`/api/documents/${id}/logs`),
  previewUrl:(id: number)     => `${api.defaults.baseURL}/api/documents/${id}/preview`,
};