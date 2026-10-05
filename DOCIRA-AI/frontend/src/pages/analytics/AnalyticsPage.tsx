import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/analytics/StatCard';
import { QueryTrendChart } from '../../components/analytics/QueryTrendChart';
import { TaskTypePieChart } from '../../components/analytics/TaskTypePieChart';
import { DocumentStatusChart } from '../../components/analytics/DocumentStatusChart';
import { TopDocumentsTable } from '../../components/analytics/TopDocumentsTable';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Database, FileText, MessageSquare, HardDrive, Zap, Clock } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { overview, dailyQueries, taskBreakdown, documentStatus, topDocuments } = useAnalytics();
  const o = overview.data;

  const stats = o ? [
    { label: 'Knowledge Bases',   value: o.total_knowledge_bases, icon: <Database size={20} />,     iconBg: 'bg-accent/10',           iconColor: 'text-accent',           sub: 'Total created' },
    { label: 'Documents',         value: o.total_documents,        icon: <FileText size={20} />,     iconBg: 'bg-success/10',          iconColor: 'text-success',          sub: `${o.completed_documents} indexed` },
    { label: 'Total Queries',     value: o.total_queries,          icon: <MessageSquare size={20} />,iconBg: 'bg-warning/10',          iconColor: 'text-warning',          sub: `${o.queries_today} today` },
    { label: 'Storage Used',      value: `${o.storage_used_mb} MB`,icon: <HardDrive size={20} />,   iconBg: 'bg-accent-secondary/10', iconColor: 'text-accent-secondary', sub: 'Across all KBs' },
    { label: 'Tokens Used',       value: o.total_tokens_used.toLocaleString(), icon: <Zap size={20} />, iconBg: 'bg-success/10', iconColor: 'text-success', sub: 'LLM tokens total' },
    { label: 'Avg Response',      value: `${o.avg_response_time_ms}ms`, icon: <Clock size={20} />,  iconBg: 'bg-accent/10',           iconColor: 'text-accent',           sub: 'AI latency' },
  ] : [];

  return (
    <AppLayout breadcrumb={['Insights', 'Analytics']}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Analytics Dashboard</h1>
        <p className="text-sm text-text-muted">Real-time insights on your document intelligence usage</p>
      </div>

      {overview.isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              {dailyQueries.data && <QueryTrendChart data={dailyQueries.data} />}
            </div>
            <div>
              {taskBreakdown.data && <TaskTypePieChart data={taskBreakdown.data} />}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documentStatus.data && <DocumentStatusChart data={documentStatus.data} />}
            {topDocuments.data   && <TopDocumentsTable  data={topDocuments.data} />}
          </div>
        </>
      )}
    </AppLayout>
  );
};