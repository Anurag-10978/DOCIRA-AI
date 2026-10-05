import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../hooks/useToast';

const icons = {
  success: <CheckCircle size={16} className="text-success" />,
  error:   <XCircle size={16} className="text-danger" />,
  info:    <Info size={16} className="text-accent" />,
};

const borders = {
  success: 'border-success/30',
  error:   'border-danger/30',
  info:    'border-accent/30',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`glass-card border ${borders[toast.type]} rounded-xl px-4 py-3 flex items-center gap-3 min-w-64 max-w-sm shadow-card fade-in`}
        >
          {icons[toast.type]}
          <span className="text-sm text-text-primary flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-text-muted hover:text-text-primary">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};