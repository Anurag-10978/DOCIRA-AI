import React from 'react';
import { GlassCard } from '../ui/GlassCard';

interface UsageGaugeProps {
  label: string;
  used: number;
  total: number;
  unit: string;
  color?: string;
}

export const UsageGauge: React.FC<UsageGaugeProps> = ({ label, used, total, unit, color = 'bg-accent' }) => {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const barColor = pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : color;

  return (
    <GlassCard className="p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-text-muted font-medium">{label}</span>
        <span className="text-xs font-bold text-text-primary">{pct}%</span>
      </div>
      <div className="w-full h-2 surface-ghost rounded-full overflow-hidden mb-2">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-text-muted">{used.toFixed(1)} / {total.toFixed(1)} {unit}</p>
    </GlassCard>
  );
};