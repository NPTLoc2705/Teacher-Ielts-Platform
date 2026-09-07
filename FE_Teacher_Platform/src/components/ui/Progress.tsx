import React from 'react';

interface ProgressProps {
  value?: number;
  className?: string;
}

export function Progress({ value = 0, className = '' }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden h-2 ${className}`}>
      <div
        className="h-full bg-[#1fb2aa] rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export default Progress;