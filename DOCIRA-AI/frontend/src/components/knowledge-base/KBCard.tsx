import React from 'react';
import { useNavigate } from 'react-router-dom';
import {  FileText, Cpu, Trash2, ArrowRight } from 'lucide-react';
import type { KnowledgeBase } from '../../services/knowledgeBaseAPI';
import { GlassCard } from '../ui/GlassCard';
import { format } from 'date-fns';

const CATEGORY_ICONS: Record<string, string> = {
  HR: '👥', Legal: '⚖️', Finance: '💰', Engineering: '⚙️',
  Sales: '📈', Operations: '🔧', Other: '📁',
};

interface KBCardProps {
  kb: KnowledgeBase;
  onDelete: (id: number) => void;
}

export const KBCard: React.FC<KBCardProps> = ({ kb, onDelete }) => {
  const navigate = useNavigate();

  return (
    <GlassCard className="p-5 group hover:border-border-active transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: `${kb.color}20`, border: `1px solid ${kb.color}40` }}
          >
            {CATEGORY_ICONS[kb.category || ''] || '📁'}
          </div>
          <div>
            <p className="font-bold text-text-primary text-sm">{kb.name}</p>
            {kb.category && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border"
                style={{ color: kb.color, backgroundColor: `${kb.color}15`, borderColor: `${kb.color}30` }}>
                {kb.category}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(kb.id); }}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all p-1 rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Description */}
      {kb.description && (
        <p className="text-xs text-text-muted mb-4 line-clamp-2">{kb.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="surface-ghost rounded-lg p-2.5 text-center">
          <p className="text-xs text-text-muted flex items-center justify-center gap-1">
            <FileText size={11} /> Docs
          </p>
          <p className="text-lg font-bold text-text-primary">{kb.document_count}</p>
        </div>
        <div className="surface-ghost rounded-lg p-2.5 text-center">
          <p className="text-xs text-text-muted flex items-center justify-center gap-1">
            <Cpu size={11} /> Chunks
          </p>
          <p className="text-lg font-bold text-text-primary">{kb.total_chunks}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-text-muted">
          {format(new Date(kb.created_at), 'd MMM yyyy')}
        </span>
        <button
          onClick={() => navigate(`/knowledge-bases/${kb.id}`)}
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: kb.color }}
        >
          Open <ArrowRight size={12} />
        </button>
      </div>
    </GlassCard>
  );
};