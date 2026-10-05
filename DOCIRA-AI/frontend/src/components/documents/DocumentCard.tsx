import React, { useState } from 'react';
import { FileText, File, FileCode, Trash2, RefreshCw, Eye, Terminal } from 'lucide-react';
import type { Document } from '../../services/documentAPI';
import { StatusBadge } from './StatusBadge';
import { GlassCard } from '../ui/GlassCard';
import { format } from 'date-fns';

const fileIcons: Record<string, React.ReactNode> = {
  pdf:  <FileText size={20} className="text-danger" />,
  docx: <File size={20} className="text-accent" />,
  txt:  <FileCode size={20} className="text-success" />,
  md:   <FileCode size={20} className="text-warning" />,
};

const fileBg: Record<string, string> = {
  pdf:  'bg-danger/10',
  docx: 'bg-accent/10',
  txt:  'bg-success/10',
  md:   'bg-warning/10',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentCardProps {
  doc: Document;
  onDelete: (id: number) => void;
  onReprocess: (id: number) => void;
  onPreview: (doc: Document) => void;
  onLogs: (doc: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc, onDelete, onReprocess, onPreview, onLogs
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <GlassCard
      className="p-4 transition-all duration-200 hover:border-border-active cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${fileBg[doc.file_type] || 'surface-ghost'} flex items-center justify-center flex-shrink-0`}>
            {fileIcons[doc.file_type] || <File size={20} className="text-text-muted" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate max-w-[160px]">{doc.title}</p>
            <p className="text-xs text-text-muted uppercase font-mono">{doc.file_type}</p>
          </div>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-text-muted">
        <span>{formatBytes(doc.file_size)}</span>
        <span className="text-right">{doc.num_pages > 0 ? `${doc.num_pages} pages` : '—'}</span>
        <span>{doc.chunk_count > 0 ? `${doc.chunk_count} chunks` : 'Not indexed'}</span>
        <span className="text-right">{format(new Date(doc.created_at), 'd MMM yy')}</span>
      </div>

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {doc.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full surface-ghost text-text-muted border border-border">
              {tag}
            </span>
          ))}
          {doc.tags.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full surface-ghost text-text-muted border border-border">
              +{doc.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {doc.status === 'failed' && doc.error_message && (
        <p className="text-[11px] text-danger bg-danger/5 border border-danger/20 rounded-lg px-2 py-1 mb-3 truncate">
          {doc.error_message}
        </p>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-1 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onPreview(doc)}
          title="Preview"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:surface-ghost transition-colors"
        >
          <Eye size={13} /> Preview
        </button>
        <button
          onClick={() => onLogs(doc)}
          title="Logs"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-text-muted hover:text-accent hover:bg-accent/5 transition-colors"
        >
          <Terminal size={13} /> Logs
        </button>
        <button
          onClick={() => onReprocess(doc.id)}
          title="Re-index"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-text-muted hover:text-warning hover:bg-warning/5 transition-colors"
        >
          <RefreshCw size={13} /> Re-index
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          title="Delete"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </GlassCard>
  );
};