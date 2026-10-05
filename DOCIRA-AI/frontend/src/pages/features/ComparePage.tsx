import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { CompareResult } from '../../components/features/CompareResult';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases';
import { useDocuments } from '../../hooks/useDocuments';
import { useAIFeatures } from '../../hooks/useAIFeatures';
import type { CompareResult as CR } from '../../services/aiFeatureAPI';
import { Scale, ArrowLeftRight } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const [kbId, setKbId]   = useState(0);
  const [docAId, setDocAId] = useState(0);
  const [docBId, setDocBId] = useState(0);
  const [focus, setFocus]   = useState('');
  const [result, setResult] = useState<CR | null>(null);

  const { data: kbs }  = useKnowledgeBases();
  const { data: docs } = useDocuments(kbId);
  const { loading, error, compare } = useAIFeatures();

  const completedDocs = docs?.filter(d => d.status === 'completed') || [];

  const handleCompare = async () => {
    if (!kbId || !docAId || !docBId || docAId === docBId) return;
    const res = await compare(kbId, docAId, docBId, focus || undefined);
    if (res) setResult(res);
  };

  return (
    <AppLayout breadcrumb={['Workspace', 'Document Comparison']}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Document Comparison</h1>
        <p className="text-sm text-text-muted">Compare two documents side-by-side using LangGraph + Ollama</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Knowledge Base</h3>
            <select value={kbId} onChange={e => { setKbId(Number(e.target.value)); setDocAId(0); setDocBId(0); setResult(null); }}
              className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-border-active">
              <option value={0}>Select knowledge base</option>
              {kbs?.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
            </select>
          </GlassCard>

          {kbId > 0 && (
            <GlassCard className="p-5 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">Document A</h3>
                <select value={docAId} onChange={e => setDocAId(Number(e.target.value))}
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-border-active">
                  <option value={0}>Select document A</option>
                  {completedDocs.filter(d => d.id !== docBId).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-xl surface-ghost flex items-center justify-center text-text-muted">
                  <ArrowLeftRight size={14} />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-success uppercase tracking-wide mb-2">Document B</h3>
                <select value={docBId} onChange={e => setDocBId(Number(e.target.value))}
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-border-active">
                  <option value={0}>Select document B</option>
                  {completedDocs.filter(d => d.id !== docAId).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Focus (optional)</h3>
            <input value={focus} onChange={e => setFocus(e.target.value)}
              placeholder="e.g. payment terms, penalties, dates"
              className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active" />
          </GlassCard>

          <Button onClick={handleCompare} loading={loading}
            disabled={!kbId || !docAId || !docBId || docAId === docBId}
            className="w-full" size="lg">
            <Scale size={16} className="mr-2" /> Compare Documents
          </Button>

          {error && <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-xl p-3">{error}</p>}
        </div>

        <div className="lg:col-span-2">
          {loading && (
            <GlassCard className="p-12 flex flex-col items-center justify-center">
              <LoadingSpinner size={40} />
              <p className="text-sm text-text-muted mt-4">LangGraph is comparing documents...</p>
              <p className="text-xs text-text-muted mt-1">classify → retrieve (parallel) → compare → Ollama</p>
            </GlassCard>
          )}
          {!loading && !result && (
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Scale size={28} className="text-accent" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">Select two documents to compare</h3>
              <p className="text-sm text-text-muted">LangGraph retrieves 4 chunks per document in parallel, then generates a structured comparison.</p>
            </GlassCard>
          )}
          {!loading && result && <CompareResult result={result} />}
        </div>
      </div>
    </AppLayout>
  );
};