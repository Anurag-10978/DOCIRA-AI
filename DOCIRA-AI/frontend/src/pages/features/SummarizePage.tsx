import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { SummaryResult } from '../../components/features/SummaryResult';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases';
import { useDocuments } from '../../hooks/useDocuments';
import { useAIFeatures } from '../../hooks/useAIFeatures';
import type { SummaryResult as SR } from '../../services/aiFeatureAPI';
import { FileText, Zap } from 'lucide-react';

const SUMMARY_TYPES = [
  { value: 'short',     label: '⚡ Short',     desc: '3-5 sentences' },
  { value: 'detailed',  label: '📋 Detailed',  desc: 'Full structured' },
  { value: 'executive', label: '👔 Executive',  desc: 'C-level ready' },
  { value: 'bullets',   label: '• Bullets',    desc: 'Key facts list' },
];

export const SummarizePage: React.FC = () => {
  const [kbId, setKbId]         = useState(0);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [summaryType, setSummaryType] = useState('detailed');
  const [result, setResult]     = useState<SR | null>(null);

  const { data: kbs }  = useKnowledgeBases();
  const { data: docs } = useDocuments(kbId);
  const { loading, error, summarize } = useAIFeatures();

  const completedDocs = docs?.filter(d => d.status === 'completed') || [];

  const toggleDoc = (id: number) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSummarize = async () => {
    if (!kbId || selectedDocs.length === 0) return;
    const res = await summarize(kbId, selectedDocs, summaryType);
    if (res) setResult(res);
  };

  return (
    <AppLayout breadcrumb={['Workspace', 'AI Summarization']}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">AI Summarization</h1>
        <p className="text-sm text-text-muted">Generate structured summaries using LangGraph + Ollama</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Knowledge Base</h3>
            <select value={kbId} onChange={e => { setKbId(Number(e.target.value)); setSelectedDocs([]); setResult(null); }}
              className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-border-active">
              <option value={0}>Select knowledge base</option>
              {kbs?.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
            </select>
          </GlassCard>

          {kbId > 0 && (
            <GlassCard className="p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Select Documents ({selectedDocs.length} selected)
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {completedDocs.length === 0 ? (
                  <p className="text-xs text-text-muted">No indexed documents yet</p>
                ) : completedDocs.map(doc => (
                  <label key={doc.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                    selectedDocs.includes(doc.id) ? 'bg-accent/10 border border-accent/30' : 'glass-card hover:border-border-active'
                  }`}>
                    <input type="checkbox" checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDoc(doc.id)} className="accent-indigo-500" />
                    <FileText size={13} className="text-accent flex-shrink-0" />
                    <span className="text-xs text-text-primary truncate">{doc.title}</span>
                  </label>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Summary Type</h3>
            <div className="space-y-2">
              {SUMMARY_TYPES.map(t => (
                <button key={t.value} onClick={() => setSummaryType(t.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    summaryType === t.value ? 'bg-accent/10 border border-accent/30' : 'glass-card hover:border-border-active'
                  }`}>
                  <span className="text-sm font-medium text-text-primary">{t.label}</span>
                  <span className="text-[11px] text-text-muted">{t.desc}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          <Button
            onClick={handleSummarize}
            loading={loading}
            disabled={!kbId || selectedDocs.length === 0}
            className="w-full"
            size="lg"
          >
            <Zap size={16} className="mr-2" /> Generate Summary
          </Button>

          {error && <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-xl p-3">{error}</p>}
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2">
          {loading && (
            <GlassCard className="p-12 flex flex-col items-center justify-center">
              <LoadingSpinner size={40} />
              <p className="text-sm text-text-muted mt-4">LangGraph is summarizing your documents...</p>
              <p className="text-xs text-text-muted mt-1">classify → retrieve → summarize → Ollama</p>
            </GlassCard>
          )}
          {!loading && !result && (
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">Ready to summarize</h3>
              <p className="text-sm text-text-muted">Select a knowledge base and documents, then click Generate.</p>
            </GlassCard>
          )}
          {!loading && result && <SummaryResult result={result} />}
        </div>
      </div>
    </AppLayout>
  );
};