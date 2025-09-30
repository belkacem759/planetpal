'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ProgressBar } from './progress-bar';

export function TransitionProgress() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let completeTimer: NodeJS.Timeout;

    const startTransition = () => {
      setIsLoading(true);
      setProgress(30); // Initial 30% progress
      
      // Simulate gradual progress increase
      progressTimer = setTimeout(() => {
        setProgress(70);
      }, 300);
    };

    const completeTransition = () => {
      setProgress(100);
      completeTimer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    };

    // Track navigation start with click events on links
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.startsWith('#') && !link.target) {
        startTransition();
      }
    };

    // Track navigation completion with pathname changes
    let previousPathname = pathname;
    const checkPathnameChange = () => {
      if (pathname !== previousPathname) {
        completeTransition();
        previousPathname = pathname;
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleLinkClick);
    
    // Check for pathname changes
    const interval = setInterval(checkPathnameChange, 100);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(completeTimer);
      clearInterval(interval);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <ProgressBar progress={progress} className="h-0.5 rounded-none bg-gray-100" />
    </div>
  );
}