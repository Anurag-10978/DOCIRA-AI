import { api } from './api';

// Helper — triggers browser download from a Blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper — safe filename from title
function safeFilename(title: string, maxLen = 30) {
  return title.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, maxLen);
}

export const exportAPI = {

  // ── Chat ──────────────────────────────────────────────────────────────────
  chatMarkdown: async (convId: number, convTitle = 'conversation') => {
    const res = await api.get(`/api/export/chat/${convId}?format=md`, {
      responseType: 'blob',
    });
    downloadBlob(res.data, `${safeFilename(convTitle)}.md`);
  },

  chatTxt: async (convId: number, convTitle = 'conversation') => {
    const res = await api.get(`/api/export/chat/${convId}?format=txt`, {
      responseType: 'blob',
    });
    downloadBlob(res.data, `${safeFilename(convTitle)}.txt`);
  },

  // ── Summary ───────────────────────────────────────────────────────────────
  summaryMarkdown: async (content: string, docTitle: string) => {
    const res = await api.post(
      '/api/export/summary',
      { content, doc_title: docTitle, format: 'md' },
      { responseType: 'blob' },
    );
    downloadBlob(res.data, `summary_${safeFilename(docTitle)}.md`);
  },

  summaryTxt: async (content: string, docTitle: string) => {
    // Convert markdown to plain text client-side (strip ## and **)
    const plain = content
      .replace(/## /g, '')
      .replace(/\*\*/g, '')
      .replace(/- /g, '• ');
    const blob = new Blob([plain], { type: 'text/plain' });
    downloadBlob(blob, `summary_${safeFilename(docTitle)}.txt`);
  },

  // ── Extraction ────────────────────────────────────────────────────────────
  extractionJson: async (content: string, docTitle: string) => {
    const res = await api.post(
      '/api/export/extraction',
      { content, doc_title: docTitle, format: 'json' },
      { responseType: 'blob' },
    );
    downloadBlob(res.data, `extraction_${safeFilename(docTitle)}.json`);
  },

  extractionCsv: async (content: string, docTitle: string) => {
    const res = await api.post(
      '/api/export/extraction',
      { content, doc_title: docTitle, format: 'csv' },
      { responseType: 'blob' },
    );
    downloadBlob(res.data, `extraction_${safeFilename(docTitle)}.csv`);
  },
};