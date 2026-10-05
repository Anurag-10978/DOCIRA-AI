import React, { useState } from 'react';
import type { Message } from '../../services/chatAPI';
import { CitationCard } from './CitationCard';
import { AIMetadataBadge } from './AIMetadataBadge';
import { Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

function renderMarkdown(content: string): React.ReactNode {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## '))
      return <h3 key={i} className="text-sm font-bold text-text-primary mt-3 mb-1">{line.slice(3)}</h3>;
    if (line.startsWith('- ') || line.startsWith('• '))
      return <li key={i} className="text-sm text-text-primary ml-4 leading-relaxed list-disc">{line.slice(2)}</li>;
    if (line.trim() === '') return <br key={i} />;
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={i} className="text-sm text-text-primary leading-relaxed">
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
      </p>
    );
  });
}

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 group">
        <div className="max-w-[70%]">
          <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {message.content}
          </div>
          <p className="text-[10px] text-text-muted text-right mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {format(new Date(message.created_at), 'HH:mm')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-4 group">
      <div className="w-7 h-7 rounded-xl bg-accent-gradient flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
        AI
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="space-y-0.5">{renderMarkdown(message.content)}</div>
          {message.citations.length > 0 && <CitationCard citations={message.citations} />}
          {message.ai_metadata && <AIMetadataBadge metadata={message.ai_metadata} />}
        </div>
        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-text-muted">{format(new Date(message.created_at), 'HH:mm')}</p>
          <button onClick={copy} className="flex items-center gap-1 text-[10px] text-text-muted hover:text-text-secondary transition-colors">
            {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};