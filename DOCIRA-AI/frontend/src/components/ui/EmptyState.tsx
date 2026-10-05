import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
    <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-5 text-4xl">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
    <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">{description}</p>
    {action && (
      <Button onClick={action.onClick}>{action.label}</Button>
    )}
  </div>
);