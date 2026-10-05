import React from 'react';

export const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-3 mb-4">
    <div className="w-7 h-7 rounded-xl bg-accent-gradient flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
      AI
    </div>
    <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);