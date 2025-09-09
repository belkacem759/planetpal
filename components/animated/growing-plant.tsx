'use client';

import { useEffect, useState } from 'react';

interface GrowingPlantProps {
  className?: string;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function GrowingPlant({ className = '', delay = 0, size = 'md' }: GrowingPlantProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-16 h-20',
    lg: 'w-20 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pot */}
        <path
          d="M25 100 L75 100 L70 120 L30 120 Z"
          fill="#8B4513"
          className="opacity-90"
        />
        
        {/* Soil */}
        <ellipse
          cx="50"
          cy="100"
          rx="25"
          ry="3"
          fill="#654321"
        />
        
        {/* Stem */}
        <line
          x1="50"
          y1="100"
          x2="50"
          y2="60"
          stroke="#228B22"
          strokeWidth="3"
          className={`transition-all duration-2000 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            strokeDasharray: '40',
            strokeDashoffset: isVisible ? '0' : '40',
            transitionDelay: `${delay}ms`
          }}
        />
        
        {/* Left leaf */}
        <path
          d="M50 70 Q35 65 40 50 Q45 55 50 70"
          fill="#32CD32"
          className={`transition-all duration-1500 ease-out transform origin-bottom ${
            isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-45'
          }`}
          style={{
            transitionDelay: `${delay + 800}ms`
          }}
        />
        
        {/* Right leaf */}
        <path
          d="M50 70 Q65 65 60 50 Q55 55 50 70"
          fill="#32CD32"
          className={`transition-all duration-1500 ease-out transform origin-bottom ${
            isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-45'
          }`}
          style={{
            transitionDelay: `${delay + 1200}ms`
          }}
        />
        
        {/* Flower */}
        <circle
          cx="50"
          cy="45"
          r="8"
          fill="#FF69B4"
          className={`transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{
            transitionDelay: `${delay + 1800}ms`
          }}
        />
        
        {/* Flower petals */}
        <g className={`transition-all duration-1000 ease-out transform origin-center ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
        style={{
          transitionDelay: `${delay + 2000}ms`
        }}>
          <circle cx="42" cy="40" r="4" fill="#FFB6C1" />
          <circle cx="58" cy="40" r="4" fill="#FFB6C1" />
          <circle cx="42" cy="50" r="4" fill="#FFB6C1" />
          <circle cx="58" cy="50" r="4" fill="#FFB6C1" />
          <circle cx="50" cy="37" r="4" fill="#FFB6C1" />
          <circle cx="50" cy="53" r="4" fill="#FFB6C1" />
        </g>
      </svg>
    </div>
  );
}

export function FloatingLeaf({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div className={`absolute ${className}`}>
      <svg
        viewBox="0 0 30 20"
        className="w-6 h-4 animate-bounce"
        style={{
          animationDelay: `${delay}ms`,
          animationDuration: '3s'
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 10 Q15 2 28 10 Q15 18 2 10"
          fill="#32CD32"
          className="opacity-70"
        />
        <line
          x1="2"
          y1="10"
          x2="15"
          y2="10"
          stroke="#228B22"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}