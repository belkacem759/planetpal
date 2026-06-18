'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProgressBar } from './progress-bar';

export function TransitionProgress() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;

    const startTransition = () => {
      setIsLoading(true);
      setProgress(30); // Initial 30% progress

      // Simulate gradual progress increase
      progressTimer = setTimeout(() => {
        setProgress(100);
      }, 300);
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


    // Add click listener to document
    document.addEventListener('click', handleLinkClick);

    // Check for pathname changes

    return () => {
      clearTimeout(progressTimer);
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