import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handler);
    }

    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">

      {/* Backdrop */}
      <div
        className="
          absolute inset-0
          bg-stone-900/20
          backdrop-blur-md
        "
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className={`
          relative
          w-full
          ${sizes[size]}
          glass-card
          rounded-[1.5rem]
          p-6
          fade-in
          border
          border-border
          shadow-[0_20px_60px_rgba(51,39,26,0.16)]
        `}
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-lg font-bold text-text-primary">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              w-8 h-8
              rounded-xl
              flex items-center justify-center
              text-text-muted
              surface-control
              border-border
              hover:bg-bg-tertiary
              hover:text-text-primary
              transition-all
              duration-200
            "
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

        </div>

        {/* Content */}
        {children}

      </div>
    </div>
  );
};