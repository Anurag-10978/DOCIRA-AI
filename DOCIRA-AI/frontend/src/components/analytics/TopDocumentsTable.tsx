import React from 'react';
import type { TopDocument } from '../../services/analyticsAPI';
import { GlassCard } from '../ui/GlassCard';
import { FileText } from 'lucide-react';

export const TopDocumentsTable: React.FC<{ data: TopDocument[] }> = ({ data }) => (
  <GlassCard className="p-5">
    <h3 className="text-sm font-semibold text-text-primary mb-4">Most Queried Documents</h3>
    {data.length === 0 ? (
      <p className="text-sm text-text-muted text-center py-8">No query data yet</p>
    ) : (
      <div className="space-y-2">
        {data.map((doc, i) => (
          <div key={doc.document_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:surface-ghost transition-colors">
            <span className="text-xs font-mono text-text-muted w-5">#{i + 1}</span>
            <FileText size={14} className="text-accent flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{doc.title}</p>
              <p className="text-[10px] text-text-muted">{doc.knowledge_base} · {doc.chunk_count} chunks</p>
            </div>
            <span className="text-xs font-bold text-accent flex-shrink-0">{doc.query_count} queries</span>
          </div>
        ))}
      </div>
    )}
  </GlassCard>
);