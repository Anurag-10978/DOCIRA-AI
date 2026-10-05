import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1 }) => {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i}
            className={`h-4 surface-ghost rounded-lg animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }
  return <div className={`surface-ghost rounded-lg animate-pulse ${className}`} />;
};

export const CardSkeleton: React.FC = () => (
  <div className="glass-card rounded-xl2 p-5 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton lines={3} />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="glass-card rounded-xl2 p-5">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-11 h-11 rounded-xl" />
    </div>
  </div>
);

export const MessageSkeleton: React.FC = () => (
  <div className="flex items-start gap-3 mb-4">
    <Skeleton className="w-7 h-7 rounded-xl flex-shrink-0" />
    <div className="flex-1 max-w-lg glass-card rounded-2xl p-4 space-y-2">
      <Skeleton lines={3} />
    </div>
  </div>
);