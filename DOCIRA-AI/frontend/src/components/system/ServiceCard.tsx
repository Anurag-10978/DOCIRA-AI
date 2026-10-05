import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ServiceCardProps {
  name: string;
  status: 'up' | 'down' | 'degraded';
  details?: React.ReactNode;
  icon: React.ReactNode;
}

const statusConfig = {
  up:       { icon: <CheckCircle size={14} className="text-success" />, label: 'Operational', dot: 'bg-success' },
  down:     { icon: <XCircle size={14} className="text-danger" />,      label: 'Down',        dot: 'bg-danger' },
  degraded: { icon: <AlertCircle size={14} className="text-warning" />, label: 'Degraded',    dot: 'bg-warning' },
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ name, status, details, icon }) => {
  const cfg = statusConfig[status] || statusConfig.down;
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot} ${status === 'up' ? 'pulse-dot' : ''}`} />
              <span className="text-[11px] text-text-muted">{cfg.label}</span>
            </div>
          </div>
        </div>
        {cfg.icon}
      </div>
      {details && <div className="mt-2 pt-2 border-t border-border text-xs text-text-muted space-y-1">{details}</div>}
    </GlassCard>
  );
};