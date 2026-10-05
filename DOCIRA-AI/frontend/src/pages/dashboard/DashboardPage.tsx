import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { useAuthStore } from '../../store/authStore';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useGlobalKeyboard } from '../../hooks/useKeyboard';
import { useTheme } from '../../context/ThemeContext';
import {
  Database,
  FileText,
  MessageSquare,
  HardDrive,
  Zap,
  Clock,
  ArrowRight,
  Upload,
  Search as SearchIcon,
  Scale,
  BarChart3,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import heroArt from '../../assets/docira-hero.svg';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { overview } = useAnalytics();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  useGlobalKeyboard();

  const o = overview.data;

  const stats = o
    ? [
        { label: 'Knowledge Bases', value: o.total_knowledge_bases, icon: <Database size={20} />, iconBg: 'bg-accent/10', iconColor: 'text-accent', path: '/knowledge-bases' },
        { label: 'Documents', value: o.total_documents, icon: <FileText size={20} />, iconBg: 'bg-success/10', iconColor: 'text-success', path: '/knowledge-bases' },
        { label: 'AI Queries', value: o.total_queries, icon: <MessageSquare size={20} />, iconBg: 'bg-warning/10', iconColor: 'text-warning', path: '/chat' },
        { label: 'Storage', value: `${o.storage_used_mb}MB`, icon: <HardDrive size={20} />, iconBg: 'bg-accent-secondary/10', iconColor: 'text-accent-secondary', path: '/analytics' },
        { label: 'Tokens Used', value: o.total_tokens_used.toLocaleString(), icon: <Zap size={20} />, iconBg: 'bg-success/10', iconColor: 'text-success', path: '/analytics' },
        { label: 'Avg Latency', value: `${o.avg_response_time_ms}ms`, icon: <Clock size={20} />, iconBg: 'bg-accent/10', iconColor: 'text-accent', path: '/analytics' },
      ]
    : [];

  const quickActions = [
    { label: 'Upload Documents', desc: 'Add PDF, DOCX, TXT, MD', icon: <Upload size={16} />, path: '/knowledge-bases' },
    { label: 'AI Chat', desc: 'Ask anything about your docs', icon: <MessageSquare size={16} />, path: '/chat' },
    { label: 'Semantic Search', desc: 'Find content by meaning', icon: <SearchIcon size={16} />, path: '/search' },
    { label: 'Summarize Documents', desc: 'Generate structured summaries', icon: <FileText size={16} />, path: '/summarize' },
    { label: 'Compare Documents', desc: 'Side-by-side AI comparison', icon: <Scale size={16} />, path: '/compare' },
    { label: 'View Analytics', desc: 'Usage insights and trends', icon: <BarChart3 size={16} />, path: '/analytics' },
  ];

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <AppLayout breadcrumb={['Overview', 'Dashboard']}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_310px] gap-5 min-h-full">
        <section className="min-w-0 fade-in">
          <div className="flex items-start justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-success pulse-dot" />
                <span className="text-xs text-text-muted">All systems operational · Ctrl+K to search</span>
              </div>
              <h1 className="text-3xl md:text-[34px] leading-tight font-extrabold tracking-tight text-text-primary">
                Document Intelligence <span className="ml-1">🧠</span>
              </h1>
              <p className="text-sm md:text-[15px] text-text-secondary mt-1.5">
                Welcome back, <span className="text-accent font-semibold">{user?.full_name?.split(' ')[0]}</span> — your AI knowledge hub is ready.
              </p>
            </div>

            <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
              <p className="text-xs text-text-muted">{today}</p>
              <div className="surface-control rounded-xl px-3 py-2 text-xs font-semibold text-text-primary flex items-center gap-2 shadow-sm">
                {resolvedTheme === 'dark' ? <Moon size={14} className="text-accent" /> : <Sun size={14} className="text-warning" />}
                {resolvedTheme === 'dark' ? 'Dark Theme' : 'Light Theme'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
            {overview.isLoading
              ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
              : stats.map((s, i) => (
                  <GlassCard
                    key={i}
                    className="p-5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(s.path)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] text-text-muted font-semibold uppercase tracking-[0.08em] truncate">{s.label}</p>
                        <p className="text-2xl font-extrabold text-text-primary mt-1.5">{s.value}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center ${s.iconColor} shrink-0`}>{s.icon}</div>
                    </div>
                    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] text-accent">View details</span>
                      <ArrowRight size={11} className="text-accent" />
                    </div>
                  </GlassCard>
                ))}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-accent" />
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-[0.12em]">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(a.path)}
                  className="glass-card rounded-xl2 p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-200 text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/15 transition-colors flex-shrink-0">
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{a.label}</p>
                    <p className="text-xs text-text-muted truncate">{a.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="dashboard-hero xl:flex hidden">
          <img src={heroArt} alt="DOCIRA-AI document intelligence" className="dashboard-hero-art soft-float" />
          <div className="dashboard-hero-copy">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">DOCIRA-AI</p>
            <h2 className="text-[27px] leading-[1.07] font-extrabold text-text-primary">
              Turn Your Documents<br />Into Intelligence
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mt-3 max-w-[250px]">
              Upload, Analyze, and Chat with your documents using the power of AI.
            </p>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
};
