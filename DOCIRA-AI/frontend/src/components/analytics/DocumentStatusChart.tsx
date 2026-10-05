import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DocumentStatusStat } from '../../services/analyticsAPI';
import { GlassCard } from '../ui/GlassCard';

export const DocumentStatusChart: React.FC<{ data: DocumentStatusStat[] }> = ({ data }) => (
  <GlassCard className="p-5">
    <h3 className="text-sm font-semibold text-text-primary mb-4">Document Status by Knowledge Base</h3>
    {data.length === 0 ? (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">No data yet</div>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="knowledge_base" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
          <Bar dataKey="completed"  name="Indexed"    fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="processing" name="Processing" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar dataKey="failed"     name="Failed"     fill="#ef4444" radius={[3, 3, 0, 0]} />
          <Bar dataKey="pending"    name="Pending"    fill="#f59e0b" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </GlassCard>
);