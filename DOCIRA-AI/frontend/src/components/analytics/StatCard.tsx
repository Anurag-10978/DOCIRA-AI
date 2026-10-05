import React from 'react';
import { GlassCard } from '../ui/GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  sub?: string;
  trend?: { value: number; positive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconBg, iconColor, sub, trend }) => (
  <GlassCard className="p-5 hover:border-border-active transition-all duration-200">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-success' : 'text-danger'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs last week
          </p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
    </div>
  </GlassCard>
);