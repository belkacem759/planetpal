'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  className?: string;
  progress: number;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  className = '', 
  progress, 
  showPercentage = false 
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`w-full bg-gray-200 rounded-full h-1 ${className}`}>
      <div
        className="bg-primary h-1 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${displayProgress}%` }}
      />
      {showPercentage && (
        <div className="text-xs text-gray-600 mt-1 text-center">
          {Math.round(displayProgress)}%
        </div>
      )}
    </div>
  );
}