import React, { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  label: string;
  onClick: () => Promise<void> | void;
  variant?: 'md' | 'txt' | 'json' | 'csv' | 'pdf';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  md:   'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20',
  txt:  'surface-ghost border-border text-text-secondary hover:surface-control',
  json: 'bg-warning/10 border-warning/30 text-warning hover:bg-warning/20',
  csv:  'bg-success/10 border-success/30 text-success hover:bg-success/20',
  pdf:  'bg-danger/10 border-danger/30 text-danger hover:bg-danger/20',
};

const variantLabels: Record<string, string> = {
  md: '.MD', txt: '.TXT', json: '.JSON', csv: '.CSV', pdf: '.PDF',
};

export const ExportButton: React.FC<ExportButtonProps> = ({
  label, onClick, variant = 'md', size = 'sm', className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onClick();
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const base = size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        inline-flex items-center gap-1.5 rounded-lg border font-medium
        transition-all duration-200 flex-shrink-0
        ${base} ${variantStyles[variant]} ${className}
        ${loading ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      {loading ? (
        <Loader2 size={11} className="animate-spin" />
      ) : done ? (
        <Check size={11} />
      ) : (
        <Download size={11} />
      )}
      {done ? 'Downloaded!' : `${label} ${variantLabels[variant]}`}
    </button>
  );
};