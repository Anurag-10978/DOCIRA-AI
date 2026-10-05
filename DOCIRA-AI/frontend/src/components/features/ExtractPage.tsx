import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { AIMetadataBadge } from '../../components/chat/AIMetadataBadge';
import { CitationCard } from '../../components/chat/CitationCard';
import { ExportMenu } from '../../components/export/ExportMenu';
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases';
import { useDocuments } from '../../hooks/useDocuments';
import { useAIFeatures } from '../../hooks/useAIFeatures';
import { exportAPI } from '../../services/exportAPI';
import type { ExtractResult } from '../../services/aiFeatureAPI';
import {
  FileSearch, FileText, FileCode,
  File, Copy, Check,
} from 'lucide-react';

const EXTRACTION_TYPES = [
  {
    value: 'contract',
    label: '📝 Contract',
    desc: 'Parties, dates, payment terms, obligations, penalties',
    fields: ['Parties', 'Effective Date', 'Payment Terms', 'Penalties', 'Governing Law'],
  },
  {
    value: 'invoice',
    label: '🧾 Invoice',
    desc: 'Vendor, client, amounts, line items, due date',
    fields: ['Invoice No.', 'Vendor', 'Client', 'Total', 'Due Date'],
  },
  {
    value: 'resume',
    label: '👤 Resume',
    desc: 'Name, skills, experience, education, certifications',
    fields: ['Name', 'Skills', 'Experience', 'Education'],
  },
  {
    value: 'auto',
    label: '🔍 Auto-detect',
    desc: 'Automatically identifies all structured fields',
    fields: ['All fields detected automatically'],
  },
];

function renderJSON(content: string): React.ReactNode {
  try {
    const parsed = JSON.parse(content);

    const renderValue = (val: any, depth = 0): React.ReactNode => {
      if (val === null) return <span className="text-text-muted italic">null</span>;
      if (typeof val === 'boolean') return <span className="text-warning">{String(val)}</span>;
      if (typeof val === 'number') return <span className="text-success">{val}</span>;
      if (typeof val === 'string') return <span className="text-text-primary">"{val}"</span>;
      if (Array.isArray(val)) {
        return (
          <div className={`ml-${Math.min(depth * 3, 9)}`}>
            {val.map((item, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-text-muted text-[10px] mt-1">•</span>
                {renderValue(item, depth + 1)}
              </div>
            ))}
          </div>
        );
      }
      if (typeof val === 'object') {
        return (
          <div className={depth > 0 ? 'ml-4' : ''}>
            {Object.entries(val).map(([k, v]) => (
              <div key={k} className="mb-1.5">
                <span className="text-accent font-semibold text-xs">{k}</span>
                <span className="text-text-muted text-xs">: </span>
                <span className="text-xs">{renderValue(v, depth + 1)}</span>
              </div>
            ))}
          </div>
        );
      }
      return <span className="text-text-secondary text-xs">{String(val)}</span>;
    };

    return (
      <div className="space-y-2">
        {renderValue(parsed)}
      </div>
    );
  } catch {
    // Not valid JSON — show as plain text
    return (
      <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
        {content}
      </pre>
    );
  }
}

export const ExtractPage: React.FC = () => {
  const [kbId, setKbId]             = useState(0);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [extractType, setExtractType]   = useState('auto');
  const [result, setResult]             = useState<ExtractResult | null>(null);
  const [copied, setCopied]             = useState(false);
  const [viewMode, setViewMode]         = useState<'rendered' | 'raw'>('rendered');

  const { data: kbs }  = useKnowledgeBases();
  const { data: docs } = useDocuments(kbId);
  const { loading, error, extract } = useAIFeatures();

  const completedDocs = docs?.filter(d => d.status === 'completed') || [];

  const toggleDoc = (id: number) =>
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );

  const handleExtract = async () => {
    if (!kbId || selectedDocs.length === 0) return;
    const res = await extract(kbId, selectedDocs, extractType);
    if (res) { setResult(res); setViewMode('rendered'); }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const docTitle = completedDocs.find(d => selectedDocs.includes(d.id))?.title || 'document';
  const selectedType = EXTRACTION_TYPES.find(t => t.value === extractType);

  return (
    <AppLayout breadcrumb={['Workspace', 'Data Extraction']}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Structured Data Extraction</h1>
        <p className="text-sm text-text-muted">
          Extract structured fields from documents — export as JSON or CSV
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Config Panel ────────────────────────── */}
        <div className="space-y-4">

          {/* KB selector */}
          <GlassCard className="p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Knowledge Base</h3>
            <select
              value={kbId}
              onChange={e => { setKbId(Number(e.target.value)); setSelectedDocs([]); setResult(null); }}
              className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-border-active"
            >
              <option value={0}>Select knowledge base</option>
              {kbs?.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
            </select>
          </GlassCard>

          {/* Document picker */}
          {kbId > 0 && (
            <GlassCard className="p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Documents ({selectedDocs.length} selected)
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {completedDocs.length === 0 ? (
                  <p className="text-xs text-text-muted">No indexed documents yet</p>
                ) : completedDocs.map(doc => (
                  <label
                    key={doc.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedDocs.includes(doc.id)
                        ? 'bg-accent/10 border border-accent/30'
                        : 'glass-card hover:border-border-active'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDoc(doc.id)}
                      className="accent-indigo-500"
                    />
                    <FileText size={13} className="text-accent flex-shrink-0" />
                    <span className="text-xs text-text-primary truncate">{doc.title}</span>
                  </label>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Extraction type */}
          <GlassCard className="p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Extraction Template</h3>
            <div className="space-y-2">
              {EXTRACTION_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setExtractType(t.value)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    extractType === t.value
                      ? 'bg-accent/10 border border-accent/30'
                      : 'glass-card hover:border-border-active'
                  }`}
                >
                  <p className="text-sm font-medium text-text-primary">{t.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{t.desc}</p>
                  {extractType === t.value && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.fields.map(f => (
                        <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          <Button
            onClick={handleExtract}
            loading={loading}
            disabled={!kbId || selectedDocs.length === 0}
            className="w-full"
            size="lg"
          >
            <FileSearch size={16} className="mr-2" /> Extract Data
          </Button>

          {error && (
            <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-xl p-3">{error}</p>
          )}
        </div>

        {/* ── Result Panel ─────────────────────────── */}
        <div className="lg:col-span-2">
          {loading && (
            <GlassCard className="p-12 flex flex-col items-center justify-center">
              <LoadingSpinner size={40} />
              <p className="text-sm text-text-muted mt-4">LangGraph is extracting structured data...</p>
              <p className="text-xs text-text-muted mt-1">classify → retrieve → extract → Ollama (JSON output)</p>
            </GlassCard>
          )}

          {!loading && !result && (
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <FileSearch size={28} className="text-accent" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">Ready to extract</h3>
              <p className="text-sm text-text-muted max-w-xs">
                Select a knowledge base, pick documents, choose a template, and click Extract Data.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-text-muted">
                <div className="glass-card rounded-xl p-3 text-left">
                  <p className="font-semibold text-text-secondary mb-1">📝 Contract</p>
                  <p>Parties, dates, terms</p>
                </div>
                <div className="glass-card rounded-xl p-3 text-left">
                  <p className="font-semibold text-text-secondary mb-1">🧾 Invoice</p>
                  <p>Amounts, vendor, items</p>
                </div>
                <div className="glass-card rounded-xl p-3 text-left">
                  <p className="font-semibold text-text-secondary mb-1">👤 Resume</p>
                  <p>Skills, experience</p>
                </div>
                <div className="glass-card rounded-xl p-3 text-left">
                  <p className="font-semibold text-text-secondary mb-1">🔍 Auto</p>
                  <p>All fields detected</p>
                </div>
              </div>
            </GlassCard>
          )}

          {!loading && result && (
            <GlassCard className="p-6 fade-in">

              {/* Header */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Extracted Data
                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-normal">
                      {selectedType?.label || extractType}
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">{docTitle}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {/* View toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    <button
                      onClick={() => setViewMode('rendered')}
                      className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        viewMode === 'rendered'
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      Rendered
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors border-l border-border ${
                        viewMode === 'raw'
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>

                  {/* Copy */}
                  <button
                    onClick={copy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass-card text-[11px] text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  {/* Export dropdown */}
                  <ExportMenu
                    triggerLabel="Export"
                    options={[
                      {
                        label: 'JSON Data',
                        format: '.JSON',
                        icon: <FileCode size={13} />,
                        color: 'text-warning',
                        onClick: () => exportAPI.extractionJson(result.content, docTitle),
                      },
                      {
                        label: 'CSV Table',
                        format: '.CSV',
                        icon: <File size={13} />,
                        color: 'text-success',
                        onClick: () => exportAPI.extractionCsv(result.content, docTitle),
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Content */}
              {viewMode === 'rendered' ? (
                <div className="surface-control rounded-xl border border-border p-5">
                  {renderJSON(result.content)}
                </div>
              ) : (
                <div className="surface-ghost rounded-xl border border-border p-4 overflow-x-auto">
                  <pre className="text-xs text-success font-mono leading-relaxed whitespace-pre">
                    {result.content}
                  </pre>
                </div>
              )}

              {/* Citations + Metadata */}
              <div className="mt-4 space-y-2">
                {result.citations.length > 0 && (
                  <CitationCard citations={result.citations} />
                )}
                {result.metadata && (
                  <AIMetadataBadge metadata={result.metadata} />
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </AppLayout>
  );
};