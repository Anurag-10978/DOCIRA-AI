import React from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';

interface HeaderProps {
  breadcrumb?: string[];
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumb = ['Overview', 'Dashboard'],
}) => (
  <header className="h-[58px] shrink-0 glass-panel border-b flex items-center justify-between px-6">
    <div className="flex items-center gap-2 text-sm min-w-0">
      {breadcrumb.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={14} className="text-text-muted shrink-0" />}
          <span
            className={
              i === breadcrumb.length - 1
                ? 'text-text-primary font-semibold truncate'
                : 'text-text-muted truncate'
            }
          >
            {crumb}
          </span>
        </React.Fragment>
      ))}
    </div>

    <div className="flex items-center gap-2.5">
      <div className="relative hidden sm:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          placeholder="Search documents..."
          className="surface-control rounded-full pl-9 pr-4 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active focus:bg-bg-tertiary w-52 transition-all shadow-sm"
        />
      </div>

      <button
        type="button"
        className="relative w-9 h-9 rounded-full surface-control flex items-center justify-center text-text-muted hover:text-text-primary transition-all shadow-sm"
        aria-label="Notifications"
      >
        <Bell size={16} />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full" />
      </button>

      <div className="hidden sm:flex items-center gap-2 rounded-full surface-control px-3 py-2 text-xs text-text-secondary shadow-sm">
        <span className="w-2 h-2 rounded-full bg-success pulse-dot" />
        <span className="font-medium">Live</span>
      </div>
    </div>
  </header>
);
