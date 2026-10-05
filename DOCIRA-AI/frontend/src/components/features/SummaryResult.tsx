import React from 'react';
import { Copy, Check } from 'lucide-react';
import type { SummaryResult as SR } from '../../services/aiFeatureAPI';
import { GlassCard } from '../ui/GlassCard';
import { AIMetadataBadge } from '../chat/AIMetadataBadge';
import { CitationCard } from '../chat/CitationCard';
import { exportAPI } from '../../services/exportAPI';
import { useState } from 'react';
import { ExportMenu } from '../export/ExportMenu';
import { FileText, FileCode } from 'lucide-react';

function renderMarkdown(content: string): React.ReactNode {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## '))
      return <h3 key={i} className="text-sm font-bold text-text-primary mt-4 mb-2 border-b border-border pb-1">{line.slice(3)}</h3>;
    if (line.startsWith('- ') || line.startsWith('• '))
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

export const SummaryResult: React.FC<{ result: SR }> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const docTitle = result.document_titles[0] || 'Document';

  const copy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary">
            {result.summary_type.charAt(0).toUpperCase() + result.summary_type.slice(1)} Summary
          </h3>
          <p className="text-xs text-text-muted mt-0.5">{result.document_titles.join(', ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-xs text-text-muted hover:text-text-secondary transition-colors">
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <ExportMenu
  options={[
    {
      label: 'Markdown',
      format: '.MD',
      icon: <FileText size={13} />,
      color: 'text-accent',
      onClick: () => exportAPI.summaryMarkdown(result.content, docTitle),
    },
    {
      label: 'Plain Text',
      format: '.TXT',
      icon: <FileCode size={13} />,
      color: 'text-text-muted',
      onClick: () => exportAPI.summaryTxt(result.content, docTitle),
    },
  ]}
/>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none space-y-1 mb-4">{renderMarkdown(result.content)}</div>

      {/* Citations + Metadata */}
      {result.citations.length > 0 && <CitationCard citations={result.citations} />}
      {result.metadata && <AIMetadataBadge metadata={result.metadata} />}
    </GlassCard>
  );
};