import React from 'react';
import { FileText, File, FileCode } from 'lucide-react';
import type { SearchResult } from '../../services/searchAPI';

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf:  <FileText size={16} className="text-danger" />,
  docx: <File size={16} className="text-accent" />,
  txt:  <FileCode size={16} className="text-success" />,
  md:   <FileCode size={16} className="text-warning" />,
};

export const SearchResultCard: React.FC<{ result: SearchResult; rank: number }> = ({ result, rank }) => {
  const score = Math.round(result.similarity_score * 100);
  const scoreColor = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-text-muted';
  const barColor   = score >= 80 ? 'bg-success'  : score >= 60 ? 'bg-warning'  : 'bg-text-muted';

  return (
    <div className="glass-card rounded-xl p-4 hover:border-border-active transition-all fade-in">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-text-muted w-5 flex-shrink-0 mt-0.5">#{rank}</span>
        <div className="flex-shrink-0 mt-0.5">{FILE_ICONS[result.file_type] || <File size={16} className="text-text-muted" />}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-text-primary truncate">{result.document_title}</p>
            <span className={`text-xs font-bold flex-shrink-0 ${scoreColor}`}>{score}%</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-text-muted">Page {result.page}</span>
            <span className="text-[10px] text-text-muted uppercase font-mono">{result.file_type}</span>
            <div className="flex-1 h-1 surface-ghost rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
            </div>
          </div>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{result.snippet}</p>
        </div>
      </div>
    </div>
  );
};