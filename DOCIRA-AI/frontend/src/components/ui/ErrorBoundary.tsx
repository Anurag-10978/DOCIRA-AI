import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-danger" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-text-muted mb-2">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <p className="text-xs text-text-muted mb-6">The error has been logged. Please refresh to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-accent-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={14} /> Refresh Page
            </button>
          </GlassCard>
        </div>
      );
    }
    return this.props.children;
  }
}