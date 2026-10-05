import React, { useState } from 'react';
import type { AIMetadata } from '../../services/chatAPI';
import { Zap, Clock, Hash, Layers, ChevronDown } from 'lucide-react';

const TASK_COLORS: Record<string, string> = {
  qa: 'text-accent', summarize: 'text-success',
  compare: 'text-warning', extract: 'text-accent-secondary',
};

const TASK_LABELS: Record<string, string> = {
  qa: 'Q&A', summarize: 'Summary', compare: 'Compare', extract: 'Extract',
};

export const AIMetadataBadge: React.FC<{ metadata: AIMetadata }> = ({ metadata }) => {
  const [expanded, setExpanded] = useState(false);
  const color = TASK_COLORS[metadata.task_type] || 'text-text-muted';
  const label = TASK_LABELS[metadata.task_type] || metadata.task_type;
  const latency = metadata.latency_ms > 1000
    ? `${(metadata.latency_ms / 1000).toFixed(1)}s`
    : `${metadata.latency_ms}ms`;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-secondary transition-colors group"
      >
        <Zap size={11} className="text-accent" />
        <span className={`font-semibold ${color}`}>{label}</span>
        <span>·</span>
        <span className="font-mono">{metadata.model}</span>
        <span>·</span>
        <Clock size={10} /><span>{latency}</span>
        <ChevronDown size={11} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-2 glass-card rounded-xl p-3 grid grid-cols-2 gap-3 text-xs fade-in">
          <div>
            <p className="text-text-muted mb-0.5">LLM Model</p>
            <p className="text-text-secondary font-mono">{metadata.model}</p>
          </div>
          <div>
            <p className="text-text-muted mb-0.5">Embedding</p>
            <p className="text-text-secondary font-mono">{metadata.embedding_model}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash size={10} className="text-accent" />
            <div>
              <p className="text-text-muted">Tokens</p>
              <p className="text-text-primary font-bold">{metadata.tokens_used}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers size={10} className="text-accent" />
            <div>
              <p className="text-text-muted">Chunks</p>
              <p className="text-text-primary font-bold">{metadata.chunks_retrieved}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};