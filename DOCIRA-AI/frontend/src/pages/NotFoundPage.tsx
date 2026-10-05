import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="text-center fade-in">
        <p className="text-8xl font-black text-white/5 mb-4 select-none">404</p>
        <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
        <p className="text-sm text-text-muted mb-8">This page doesn't exist in your knowledge base either.</p>
        <Button onClick={() => navigate('/dashboard')}>
          <Home size={16} className="mr-2" /> Back to Dashboard
        </Button>
      </div>
    </div>
  );
};