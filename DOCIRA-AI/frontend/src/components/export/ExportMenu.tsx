import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';

interface ExportOption {
  label: string;
  format: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => Promise<void> | void;
}

interface ExportMenuProps {
  options: ExportOption[];
  triggerLabel?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  options,
  triggerLabel = 'Export',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-xs text-accent hover:bg-accent/20 transition-colors font-medium"
      >
        <Download size={12} />
        {triggerLabel}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border shadow-card z-50 overflow-hidden fade-in"
          style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}
        >
          <p className="text-[10px] text-text-muted px-3 py-2 uppercase tracking-wider border-b border-border">
            Download as
          </p>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={async () => { setOpen(false); await opt.onClick(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-text-secondary hover:surface-ghost hover:text-text-primary transition-colors text-left"
            >
              <span className={opt.color}>{opt.icon}</span>
              <span>{opt.label}</span>
              <span className="ml-auto text-[10px] text-text-muted font-mono">{opt.format}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};