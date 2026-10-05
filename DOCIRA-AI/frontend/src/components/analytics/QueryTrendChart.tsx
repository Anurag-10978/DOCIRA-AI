import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { DailyQueryCount } from '../../services/analyticsAPI';
import { GlassCard } from '../ui/GlassCard';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl p-3 text-xs" style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}>
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export const QueryTrendChart: React.FC<{ data: DailyQueryCount[] }> = ({ data }) => {
  // Show last 14 days labels to avoid crowding
  const displayData = data.map(d => ({
    ...d,
    date: d.date.slice(5),  // MM-DD only
  }));

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Query Trends (30 days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false}
            interval={Math.floor(displayData.length / 6)} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
          <Line type="monotone" dataKey="count" name="Total" stroke="#6366f1" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="qa" name="Q&A" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="summarize" name="Summary" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="search" name="Search" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};