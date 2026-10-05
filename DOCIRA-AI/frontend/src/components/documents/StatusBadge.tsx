import React from 'react';
import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';

type Status = 'pending' | 'processing' | 'completed' | 'failed';

const config: Record<Status, { label: string; icon: React.ReactNode; classes: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock size={11} />,
    classes: 'bg-warning/15 text-warning border-warning/30',
  },
  processing: {
    label: 'Processing',
    icon: <Loader2 size={11} className="animate-spin" />,
    classes: 'bg-accent/15 text-accent border-accent/30',
  },
  completed: {
    label: 'Indexed',
    icon: <CheckCircle size={11} />,
    classes: 'bg-success/15 text-success border-success/30',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle size={11} />,
    classes: 'bg-danger/15 text-danger border-danger/30',
  },
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${c.classes}`}>
      {c.icon}
      {c.label}
    </span>
  );
};