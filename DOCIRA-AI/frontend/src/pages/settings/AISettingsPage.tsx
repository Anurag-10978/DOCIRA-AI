import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { SliderSetting } from '../../components/settings/SliderSetting';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useSettings } from '../../hooks/useSettings';
import type { AISettings } from '../../services/settingsAPI';
import { Zap, Download, Sun, Moon, Monitor } from 'lucide-react';

export const AISettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const { settings, models, update, pullModel } = useSettings();

  const [form, setForm] = useState<AISettings | null>(null);
  const [pullInput, setPullInput] = useState('');

  useEffect(() => {
    if (settings.data && !form) {
      setForm(settings.data);
    }
  }, [settings.data, form]);

  const set = (key: keyof AISettings, value: any) =>
    setForm(prev => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = () => {
    if (!form) return;
    update.mutate(form);
  };

  if (settings.isLoading || !form) {
    return (
      <AppLayout breadcrumb={['System', 'AI Settings']}>
        <div className="flex justify-center py-20">
          <LoadingSpinner size={32} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumb={['System', 'AI Settings']}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          AI Settings
        </h1>

        <p className="text-sm text-text-muted">
          Configure LangChain + Ollama models and RAG parameters
        </p>
      </div>

      {/* Appearance */}
      <GlassCard className="mb-6 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-text-primary">
            Appearance
          </h2>

          <p className="text-sm text-text-secondary mt-1">
            Choose how DOCIRA-AI should look.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'light' as const, label: 'Light', desc: 'Bright and clean', icon: <Sun size={22} /> },
            { key: 'dark' as const, label: 'Dark', desc: 'Easy on the eyes', icon: <Moon size={22} /> },
            { key: 'system' as const, label: 'System', desc: 'Follow device theme', icon: <Monitor size={22} /> },
          ].map(option => (
            <button
              key={option.key}
              type="button"
              onClick={() => setTheme(option.key)}
              className={`surface-control rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 ${theme === option.key
                ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(124,58,237,0.14),0_12px_30px_rgba(124,58,237,0.10)]'
                : 'border-border hover:border-accent/50'
              }`}
            >
              <div className={`mb-3 ${theme === option.key ? 'text-accent' : 'text-text-secondary'}`}>
                {option.icon}
              </div>
              <div className="font-medium text-text-primary">{option.label}</div>
              <div className="text-xs text-text-secondary mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Models */}
        <GlassCard className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary">
            Model Configuration
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              LLM Model (ChatOllama)
            </label>

            <select
              value={form.llm_model}
              onChange={e => set('llm_model', e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-border-active"
            >
              {models.data?.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}

              <option value={form.llm_model}>
                {form.llm_model}
              </option>
            </select>

            <p className="text-[11px] text-text-muted">
              Used in: ChatPromptTemplate | ChatOllama | StrOutputParser
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Embedding Model (OllamaEmbeddings)
            </label>

            <select
              value={form.embedding_model}
              onChange={e => set('embedding_model', e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-border-active"
            >
              {models.data?.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}

              <option value={form.embedding_model}>
                {form.embedding_model}
              </option>
            </select>

            <p className="text-[11px] text-text-muted">
              Used in: QdrantVectorStore.similarity_search_with_score()
            </p>
          </div>

          {/* Pull new model */}
          <div className="pt-3 border-t border-border space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Pull New Model
            </label>

            <div className="flex gap-2">
              <input
                value={pullInput}
                onChange={e => setPullInput(e.target.value)}
                placeholder="e.g. llama3.1, mistral, phi3"
                className="flex-1 bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active"
              />

              <Button
                onClick={() => {
                  pullModel.mutate(pullInput);
                  setPullInput('');
                }}
                loading={pullModel.isPending}
                disabled={!pullInput.trim()}
                size="sm"
              >
                <Download size={13} className="mr-1" />
                Pull
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* RAG Parameters */}
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-sm font-semibold text-text-primary">
            RAG Parameters
          </h3>

          <SliderSetting
            label="Chunk Size"
            value={form.chunk_size}
            min={200}
            max={2000}
            step={100}
            description="RecursiveCharacterTextSplitter"
            onChange={v => set('chunk_size', v)}
          />

          <SliderSetting
            label="Chunk Overlap"
            value={form.chunk_overlap}
            min={0}
            max={400}
            step={25}
            description="Overlap between chunks"
            onChange={v => set('chunk_overlap', v)}
          />

          <SliderSetting
            label="Max Context Chunks"
            value={form.max_context_chunks}
            min={2}
            max={12}
            step={1}
            description="Chunks retrieved per query"
            onChange={v => set('max_context_chunks', v)}
          />

          <SliderSetting
            label="Temperature"
            value={form.temperature}
            min={0}
            max={1}
            step={0.05}
            description="LLM creativity (0=deterministic)"
            onChange={v => set('temperature', v)}
          />

          <Button
            onClick={handleSave}
            loading={update.isPending}
            className="w-full"
            size="lg"
          >
            <Zap size={16} className="mr-2" />
            Save Settings
          </Button>
        </GlassCard>
      </div>
    </AppLayout>
  );
};