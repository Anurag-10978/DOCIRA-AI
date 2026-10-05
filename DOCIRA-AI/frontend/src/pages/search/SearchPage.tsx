import React, { useState } from 'react';
import { Search, Zap, Clock, TrendingUp } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { GlassCard } from '../../components/ui/GlassCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SearchResultCard } from '../../components/search/SearchResultCard';
import { useSearch } from '../../hooks/useSearch';
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases';

export const SearchPage: React.FC = () => {
  const [kbId, setKbId] = useState(0);
  const [query, setQuery] = useState('');
  const { data: kbs } = useKnowledgeBases();
  const { results, loading, error, search, history, frequent } = useSearch(kbId);

  const handleSearch = (q?: string) => {
    const sq = q || query;
    if (!sq.trim() || !kbId) return;
    if (q) setQuery(q);
    search(sq);
  };

  return (
    <AppLayout breadcrumb={['Workspace', 'Semantic Search']}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Semantic Search</h1>
        <p className="text-sm text-text-muted">Find anything using meaning, not just keywords — powered by LangChain + Qdrant</p>
      </div>

      <GlassCard className="p-4 mb-6">
        <div className="flex gap-3">
          <select
            value={kbId}
            onChange={e => setKbId(Number(e.target.value))}
            className="bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-border-active w-48 flex-shrink-0"
          >
            <option value={0}>Select knowledge base</option>
            {kbs?.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
          </select>

          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="What are the payment terms? / Who are the parties?"
              className="w-full bg-bg-tertiary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={!kbId || !query.trim() || loading}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              kbId && query.trim() && !loading
                ? 'bg-accent-gradient text-white shadow-accent hover:opacity-90'
                : 'surface-ghost text-text-muted cursor-not-allowed'
            }`}
          >
            {loading ? <LoadingSpinner size={16} /> : <Zap size={16} />}
            Search
          </button>
        </div>

        {frequent.length > 0 && !results && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <TrendingUp size={12} className="text-text-muted" />
            <span className="text-[11px] text-text-muted">Frequent:</span>
            {frequent.slice(0, 6).map(f => (
              <button key={f.query} onClick={() => handleSearch(f.query)}
                className="text-[11px] px-2.5 py-1 rounded-full surface-ghost text-text-muted hover:text-accent hover:bg-accent/10 border border-border hover:border-accent/30 transition-all">
                {f.query}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {error && <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 text-sm text-danger mb-4">{error}</div>}

          {results && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">{results.total}</span> results for{' '}
                  <span className="text-accent">"{results.query}"</span>
                </p>
                <span className="text-xs text-text-muted">{results.latency_ms}ms · LangChain OllamaEmbeddings</span>
              </div>
              <div className="space-y-3">
                {results.results.length === 0 ? (
                  <GlassCard className="p-8 text-center">
                    <Search size={32} className="mx-auto text-text-muted mb-3" />
                    <p className="text-sm text-text-muted">No relevant content found. Upload and index more documents.</p>
                  </GlassCard>
                ) : results.results.map((r, i) => <SearchResultCard key={i} result={r} rank={i + 1} />)}
              </div>
            </div>
          )}

          {!results && !loading && (
            <GlassCard className="p-12 text-center">
              <Search size={40} className="mx-auto text-text-muted mb-4" />
              <h3 className="text-base font-bold text-text-primary mb-2">Ready to search</h3>
              <p className="text-sm text-text-muted">Select a knowledge base and enter your query.</p>
            </GlassCard>
          )}
        </div>

        <div className="lg:col-span-1">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-text-muted" />
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Recent</h3>
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-text-muted">No search history yet.</p>
            ) : history.slice(0, 10).map(h => (
              <button key={h.id} onClick={() => handleSearch(h.query_text)}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-secondary hover:surface-ghost transition-colors truncate block">
                {h.query_text}
              </button>
            ))}
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
};