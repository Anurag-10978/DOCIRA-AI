import React, { useState } from 'react';
import type { Citation } from '../../services/chatAPI';
import { BookOpen, FileText, ChevronDown } from 'lucide-react';

export const CitationCard: React.FC<{ citations: Citation[] }> = ({ citations }) => {
  const [open, setOpen] = useState(false);
  if (!citations.length) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-accent transition-colors"
      >
        <BookOpen size={11} />
        <span>{citations.length} source{citations.length > 1 ? 's' : ''}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-2 space-y-2 fade-in">
          {citations.map((c, i) => (
            <div key={i} className="glass-card rounded-xl p-3 border border-border">
              <div className="flex items-start gap-2 mb-1.5">
                <FileText size={12} className="text-accent mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-primary truncate">{c.document_title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-muted">Page {c.page}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${
                      c.similarity_score >= 0.8 ? 'bg-success/10 text-success border-success/20'
                      : c.similarity_score >= 0.6 ? 'bg-warning/10 text-warning border-warning/20'
                      : 'surface-ghost text-text-muted border-border'
                    }`}>
                      {Math.round(c.similarity_score * 100)}% match
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed line-clamp-3 pl-5">
                {c.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};