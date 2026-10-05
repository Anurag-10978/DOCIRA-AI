import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../../components/layout/AppLayout';
import { ServiceCard } from '../../components/system/ServiceCard';
import { UsageGauge } from '../../components/system/UsageGauge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { api } from '../../services/api';
import { Database, Cpu, RefreshCw } from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.get('/api/system/health').then(r => r.data),
    refetchInterval: 30000,
  });

  return (
    <AppLayout breadcrumb={['System', 'Health Dashboard']}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">System Health</h1>
          <p className="text-sm text-text-muted">Real-time status of all DOCIRA-AI services</p>
        </div>
        <button onClick={() => refetch()}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm text-text-secondary hover:text-text-primary transition-colors ${isFetching ? 'opacity-50' : ''}`}>
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
      ) : data && (
        <>
          {/* Overall status */}
          <div className={`px-5 py-3 rounded-xl border mb-6 flex items-center gap-3 ${
            data.status === 'healthy' ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'
          }`}>
            <span className={`w-3 h-3 rounded-full ${data.status === 'healthy' ? 'bg-success pulse-dot' : 'bg-warning'}`} />
            <p className="text-sm font-semibold text-text-primary">
              System {data.status === 'healthy' ? 'Operational' : 'Degraded'}
            </p>
          </div>

          {/* Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ServiceCard
              name="Ollama (Local LLM)"
              status={data.services.ollama?.status === 'up' ? 'up' : 'down'}
              icon={<Cpu size={18} />}
              details={
                data.services.ollama?.models?.length > 0 ? (
                  <div>
                    <p className="text-[11px] text-text-muted mb-1">Available models:</p>
                    {data.services.ollama.models.map((m: string) => (
                      <p key={m} className="text-[11px] font-mono text-success">• {m}</p>
                    ))}
                  </div>
                ) : null
              }
            />
            <ServiceCard
              name="Qdrant (Vector DB)"
              status={data.services.qdrant?.status === 'up' ? 'up' : 'down'}
              icon={<Database size={18} />}
              details={
                data.services.qdrant?.collections?.length > 0 ? (
                  <div>
                    {data.services.qdrant.collections.map((c: any) => (
                      <p key={c.name} className="text-[11px] font-mono text-accent">
                        {c.name}: {c.vectors.toLocaleString()} vectors
                      </p>
                    ))}
                  </div>
                ) : null
              }
            />
          </div>

          {/* Resource gauges */}
          <h3 className="text-sm font-semibold text-text-secondary mb-3">System Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UsageGauge label="CPU" used={data.system.cpu_percent} total={100} unit="%" color="bg-accent" />
            <UsageGauge label="Memory" used={data.system.memory_used_gb} total={data.system.memory_total_gb} unit=" GB" color="bg-success" />
            <UsageGauge label="Disk" used={data.system.disk_used_gb} total={data.system.disk_total_gb} unit=" GB" color="bg-warning" />
          </div>
        </>
      )}
    </AppLayout>
  );
};