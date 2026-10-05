import React, { useState, useRef, useEffect } from 'react';
import type {KeyboardEvent} from 'react';
import {
  Send,
  Database,
  FileText,
  FileCode
} from 'lucide-react';

import { ExportMenu } from '../export/ExportMenu';
import { exportAPI } from '../../services/exportAPI';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases';
import type { Message } from '../../services/chatAPI';

const TASK_OPTIONS = [
  { value: 'qa',        label: '❓ Q&A' },
  { value: 'summarize', label: '📄 Summarize' },
  { value: 'compare',   label: '⚖️ Compare' },
  { value: 'extract',   label: '🔍 Extract' },
];

const SUGGESTIONS = [
  "What are the payment terms?",
  "Summarize this document",
  "What key dates are mentioned?",
  "Extract all parties involved",
];

interface Props {
  conversationId: number | null;
  messages: Message[];
  isTyping: boolean;
  onSend: (content: string, taskType: string) => void;
  kbId: number | null;
  onKbChange: (id: number) => void;

  activeConvTitle?: string;
}

export const ChatWindow: React.FC<Props> = ({
  conversationId,
  messages,
 isTyping,
  onSend,
  kbId,
  onKbChange,
  activeConvTitle,
}) => {
  const [input, setInput] = useState('');
  const [taskType, setTaskType] = useState('qa');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: kbs } = useKnowledgeBases();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !conversationId) return;
    onSend(trimmed, taskType);
    setInput('');
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border flex-wrap">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-accent" />
          <select
            value={kbId || ''}
            onChange={e => onKbChange(Number(e.target.value))}
            className="bg-bg-tertiary border border-border rounded-lg px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-border-active"
          >
            <option value="">Select knowledge base</option>
            {kbs?.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          {TASK_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTaskType(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                taskType === opt.value
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-text-muted hover:text-text-secondary hover:surface-ghost'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {conversationId && (
  <div className="ml-auto">
    <ExportMenu
      triggerLabel="Export Chat"
      options={[
        {
          label: 'Markdown',
          format: '.MD',
          icon: <FileText size={13} />,
          color: 'text-accent',
          onClick: () => exportAPI.chatMarkdown(
            conversationId,
            activeConvTitle || 'conversation'
          ),
        },
        {
          label: 'Plain Text',
          format: '.TXT',
          icon: <FileCode size={13} />,
          color: 'text-text-muted',
          onClick: () => exportAPI.chatTxt(
            conversationId,
            activeConvTitle || 'conversation'
          ),
        },
      ]}
    />
  </div>
)}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="text-base font-bold text-text-primary mb-4">Ask anything about your documents</h3>
            <div className="grid grid-cols-2 gap-2 max-w-md">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)}
                  className="glass-card rounded-xl p-3 text-xs text-text-muted hover:text-text-secondary hover:border-border-active transition-all text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="glass-card rounded-xl p-3 flex items-end gap-3" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={conversationId ? "Ask a question, request a summary, compare documents..." : "Select a knowledge base to start"}
            disabled={!conversationId}
            rows={1}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none max-h-32 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !conversationId}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              input.trim() && conversationId
                ? 'bg-accent-gradient text-white shadow-accent hover:opacity-90'
                : 'surface-ghost text-text-muted cursor-not-allowed'
            }`}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-text-muted text-center mt-1.5">
          Enter to send · Shift+Enter for newline · Powered by LangGraph + LangChain + Groq
        </p>
      </div>
    </div>
  );
};