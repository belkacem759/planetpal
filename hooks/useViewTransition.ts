'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useViewTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let completeTimer: NodeJS.Timeout;

    const startTransition = () => {
      setIsTransitioning(true);
      setProgress(30); // Initial 30% progress
      
      // Simulate gradual progress increase
      progressTimer = setTimeout(() => {
        setProgress(70);
      }, 300);
    };

    const completeTransition = () => {
      setProgress(100);
      completeTimer = setTimeout(() => {
        setIsTransitioning(false);
        setProgress(0);
      }, 200);
    };

    // Listen for route changes
    const handleRouteChangeStart = () => {
      startTransition();
    };

    const handleRouteChangeComplete = () => {
      completeTransition();
    };

    // Since we're using app router, we'll track pathname changes
    let previousPathname = pathname;
    
    const checkPathnameChange = () => {
      if (pathname !== previousPathname) {
        handleRouteChangeComplete();
        previousPathname = pathname;
      }
    };

    // Check for pathname changes
    const interval = setInterval(checkPathnameChange, 100);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(completeTimer);
      clearInterval(interval);
    };
  }, [pathname]);

  const navigateWithTransition = (href: string) => {
    setIsTransitioning(true);
    setProgress(30);
    router.push(href);
  };

  return {
    isTransitioning,
    navigateWithTransition,
    progress,
  };
}