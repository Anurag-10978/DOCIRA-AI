import React from 'react';

interface ProgressBarProps {
  value: number;   // 0–100
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color = 'bg-accent-gradient',
}) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between text-xs text-text-muted mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
    )}
    <div className="w-full h-1.5 surface-ghost rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);