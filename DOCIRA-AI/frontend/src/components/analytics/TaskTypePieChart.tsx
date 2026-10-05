import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TaskTypeBreakdown } from '../../services/analyticsAPI';
import { GlassCard } from '../ui/GlassCard';

const COLORS: Record<string, string> = {
  qa: '#6366f1', summarize: '#10b981',
  compare: '#f59e0b', extract: '#8b5cf6', search: '#06b6d4',
};

const LABELS: Record<string, string> = {
  qa: 'Q&A', summarize: 'Summary',
  compare: 'Compare', extract: 'Extract', search: 'Search',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card rounded-xl p-3 text-xs" style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}>
      <p className="text-text-primary font-semibold">{LABELS[d.task_type] || d.task_type}</p>
      <p className="text-text-muted">{d.count} queries · {d.percentage}%</p>
    </div>
  );
};

export const TaskTypePieChart: React.FC<{ data: TaskTypeBreakdown[] }> = ({ data }) => (
  <GlassCard className="p-5">
    <h3 className="text-sm font-semibold text-text-primary mb-4">Task Distribution</h3>
    {data.length === 0 ? (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">No data yet</div>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            dataKey="count" nameKey="task_type" paddingAngle={3}>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.task_type] || '#6366f1'} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => LABELS[value] || value}
            wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    )}
  </GlassCard>
);