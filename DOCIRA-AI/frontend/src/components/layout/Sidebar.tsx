import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  Search,
  BarChart2,
  LogOut,
  ChevronLeft,
  Zap,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { FileSearch } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard', section: 'Overview' },
  { label: 'Extract Data', icon: <FileSearch size={18} />, path: '/extract', section: 'Workspace' },
  { label: 'Knowledge Bases', icon: <Database size={18} />, path: '/knowledge-bases', section: 'Workspace' },
  { label: 'AI Chat', icon: <MessageSquare size={18} />, path: '/chat', section: 'Workspace' },
  { label: 'Search', icon: <Search size={18} />, path: '/search', section: 'Workspace' },
  { label: 'Analytics', icon: <BarChart2 size={18} />, path: '/analytics', section: 'Insights', badge: 'Beta' },
  { label: 'System Health', icon: <Activity size={18} />, path: '/system', section: 'System' },
  { label: 'AI Settings', icon: <Zap size={18} />, path: '/settings/ai', section: 'System' },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const sections = ['Overview', 'Workspace', 'Insights', 'System'];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <aside
      className={`flex flex-col h-full glass-panel border-r transition-all duration-300 relative shrink-0 ${collapsed ? 'w-16' : 'w-[216px]'
        }`}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border surface-ghost">
        <div className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center flex-shrink-0 shadow-accent">
          <img
            src="/docira-logo.svg"
            alt="DOCIRA-AI"
            className="w-5 h-5"
          />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary leading-tight">DOCIRA-AI</p>
            <p className="text-[10px] text-accent leading-tight">AI-Powered Docs</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-text-muted hover:text-text-primary transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {!collapsed && user && (
        <div className="px-4 py-4 border-b border-border">
          <p className="text-sm font-semibold text-text-primary leading-tight">Welcome Back,</p>
          <p className="text-sm font-bold text-accent leading-tight">{user.full_name.split(' ')[0]}</p>
          {user.last_login && (
            <p className="text-[10px] text-text-muted mt-1">
              Last login: {format(new Date(user.last_login), 'd MMM yyyy')}
            </p>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {sections.map(section => {
          const items = navItems.filter(n => n.section === section);
          if (!items.length) return null;

          return (
            <div key={section} className="mb-3">
              {!collapsed && (
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.14em] px-3 mb-1.5">
                  {section}
                </p>
              )}

              {items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group ${isActive
                        ? 'nav-active text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                      }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-accent' : 'group-hover:text-text-primary'}`}>
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <>
                        <span className="flex-1 font-medium truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            {item.badge}
                          </span>
                        )}
                        {isActive && <span className="w-1 h-4 bg-accent rounded-full flex-shrink-0" />}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border surface-ghost">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-accent">
            {user ? getInitials(user.full_name) : 'U'}
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{user?.full_name}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="text-text-muted hover:text-danger transition-colors p-1 rounded"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
