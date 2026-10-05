import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentAPI } from '../../services/documentAPI';
import type { Document } from '../../services/documentAPI';
import { StatusBadge } from './StatusBadge';
import { Terminal } from 'lucide-react';

interface ProcessingLogsProps {
  doc: Document;
}

export const ProcessingLogs: React.FC<ProcessingLogsProps> = ({ doc }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['logs', doc.id],
    queryFn: () => documentAPI.getLogs(doc.id).then(r => r.data),
    refetchInterval: doc.status === 'processing' || doc.status === 'pending' ? 2000 : false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.logs]);

  const logs = data?.logs || doc.processing_logs;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-accent" />
          <span className="text-xs font-mono text-text-secondary">{doc.filename}</span>
        </div>
        <StatusBadge status={(data?.status || doc.status) as any} />
      </div>

      {/* Log terminal */}
      <div
        className="surface-ghost rounded-xl border border-border p-4 h-64 overflow-y-auto font-mono text-xs"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        {logs.length === 0 ? (
          <p className="text-text-muted">No logs yet...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`leading-relaxed ${
              log.includes('❌') ? 'text-danger' :
              log.includes('✅') || log.includes('🎉') ? 'text-success' :
              log.includes('🧠') || log.includes('💾') ? 'text-accent' :
              'text-text-secondary'
            }`}>
              {log}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="glass-card rounded-lg p-3">
            <p className="text-text-muted">Chunks Indexed</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">{data.chunk_count}</p>
          </div>
          <div className="glass-card rounded-lg p-3">
            <p className="text-text-muted">Completed At</p>
            <p className="text-sm font-semibold text-text-primary mt-0.5">
              {data.processed_at
                ? new Date(data.processed_at).toLocaleTimeString()
                : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};