import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CompareResult as CR } from '../../services/aiFeatureAPI';
import { GlassCard } from '../ui/GlassCard';
import { AIMetadataBadge } from '../chat/AIMetadataBadge';
import { CitationCard } from '../chat/CitationCard';
import { ExportMenu } from '../export/ExportMenu';
import { exportAPI } from '../../services/exportAPI';
import { FileText, FileCode } from 'lucide-react';


function renderMarkdown(content: string): React.ReactNode {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## '))
      return <h3 key={i} className="text-sm font-bold text-text-primary mt-4 mb-2 border-b border-border pb-1">{line.slice(3)}</h3>;
    if (line.startsWith('- '))
      return <li key={i} className="text-sm text-text-secondary ml-4 leading-relaxed list-disc">{line.slice(2)}</li>;
    if (line.trim() === '') return <br key={i} />;
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={i} className="text-sm text-text-secondary leading-relaxed">
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-text-primary">{p}</strong> : p)}
      </p>
    );
  });
}

export const CompareResult: React.FC<{ result: CR }> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  return (
    <GlassCard className="p-6 fade-in">
      {/* Doc badges */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 font-medium">
          A: {result.doc_a.title}
        </span>
        <span className="text-xs text-text-muted">vs</span>
        <span className="text-xs px-3 py-1 rounded-full bg-success/15 text-success border border-success/30 font-medium">
          B: {result.doc_b.title}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { navigator.clipboard.writeText(result.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-xs text-text-muted hover:text-text-secondary transition-colors">
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <ExportMenu
  options={[
    {
      label: 'Comparison MD',
      format: '.MD',
      icon: <FileText size={13} />,
      color: 'text-accent',
      onClick: () =>
        exportAPI.summaryMarkdown(
          result.content,
          `Compare_${result.doc_a.title}_vs_${result.doc_b.title}`
        ),
    },
    {
      label: 'Plain Text',
      format: '.TXT',
      icon: <FileCode size={13} />,
      color: 'text-text-muted',
      onClick: () =>
        exportAPI.summaryTxt(
          result.content,
          `Compare_${result.doc_a.title}_vs_${result.doc_b.title}`
        ),
    },
  ]}
/>
        </div>
      </div>

      <div className="space-y-1 mb-4">{renderMarkdown(result.content)}</div>

      {result.citations.length > 0 && <CitationCard citations={result.citations} />}
      {result.metadata && <AIMetadataBadge metadata={result.metadata} />}
    </GlassCard>
  );
};