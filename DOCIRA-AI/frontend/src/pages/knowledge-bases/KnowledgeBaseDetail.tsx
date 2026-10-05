import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, ArrowLeft, Database } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { UploadModal } from '../../components/documents/UploadModal';
import { ProcessingLogs } from '../../components/documents/ProcessingLogs';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { GlassCard } from '../../components/ui/GlassCard';
import { useDocuments } from '../../hooks/useDocuments';
import { knowledgeBaseAPI } from '../../services/knowledgeBaseAPI';
import { documentAPI } from '../../services/documentAPI';
import type { Document } from '../../services/documentAPI';

export const KnowledgeBaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const kbId = parseInt(id!);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showUpload, setShowUpload]     = useState(false);
  const [logsDoc, setLogsDoc]           = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc]     = useState<Document | null>(null);

  const { data: kb } = useQuery({
    queryKey: ['kb', kbId],
    queryFn: () => knowledgeBaseAPI.get(kbId).then(r => r.data),
  });

  const { data: docs, isLoading, remove, reprocess } = useDocuments(kbId);

  const stats = docs ? {
    total: docs.length,
    completed: docs.filter(d => d.status === 'completed').length,
    processing: docs.filter(d => d.status === 'processing' || d.status === 'pending').length,
    failed: docs.filter(d => d.status === 'failed').length,
    chunks: docs.reduce((s, d) => s + d.chunk_count, 0),
  } : null;

  return (
    <AppLayout breadcrumb={['Knowledge Bases', kb?.name || '...']}>
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/knowledge-bases')}
          className="p-2 rounded-xl glass-card text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{kb?.name || 'Loading...'}</h1>
          {kb?.description && <p className="text-sm text-text-muted mt-0.5">{kb.description}</p>}
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload size={16} className="mr-1.5" /> Upload Document
        </Button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-text-primary' },
            { label: 'Indexed', value: stats.completed, color: 'text-success' },
            { label: 'Processing', value: stats.processing, color: 'text-accent' },
            { label: 'Failed', value: stats.failed, color: 'text-danger' },
            { label: 'Chunks', value: stats.chunks, color: 'text-warning' },
          ].map(s => (
            <GlassCard key={s.label} className="p-3 text-center">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className={`text-xl font-bold ${s.color} mt-0.5`}>{s.value}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Documents grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
      ) : !docs || docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <Database size={28} className="text-accent" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No documents yet</h3>
          <p className="text-sm text-text-muted mb-6 max-w-sm">
            Upload your first document to start building your knowledge base.
          </p>
          <Button onClick={() => setShowUpload(true)}>
            <Plus size={16} className="mr-1.5" /> Upload First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
          {docs.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={() => remove.mutate(doc.id)}
              onReprocess={() => reprocess.mutate(doc.id)}
              onPreview={() => setPreviewDoc(doc)}
              onLogs={() => setLogsDoc(doc)}
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <UploadModal
      open={showUpload}
      onClose={() => setShowUpload(false)}
      kbId={kbId}
      onSuccess={() => {
        queryClient.invalidateQueries({
          queryKey: ['documents', kbId],
        });

        queryClient.invalidateQueries({
          queryKey: ['knowledge-bases'],
        });

        queryClient.invalidateQueries({
          queryKey: ['kb', kbId],
        });
      }}
    />

      {/* Processing logs modal */}
      <Modal open={!!logsDoc} onClose={() => setLogsDoc(null)} title="Processing Logs" size="md">
        {logsDoc && <ProcessingLogs doc={logsDoc} />}
      </Modal>

      {/* Preview modal */}
      <Modal open={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc?.title || 'Preview'} size="lg">
        {previewDoc && (
          <div className="h-[60vh]">
            {previewDoc.file_type === 'pdf' ? (
              <iframe
                src={documentAPI.previewUrl(previewDoc.id)}
                className="w-full h-full rounded-lg border border-border"
                title="Document Preview"
              />
            ) : (
              <div className="w-full h-full overflow-auto surface-ghost rounded-lg border border-border p-4 font-mono text-xs text-text-secondary">
                <p className="text-text-muted">Preview loads at: {documentAPI.previewUrl(previewDoc.id)}</p>
                <p className="mt-2 text-success">File: {previewDoc.filename} ({previewDoc.file_type})</p>
                <p className="mt-1 text-accent">Status: {previewDoc.status} | Chunks: {previewDoc.chunk_count}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
};