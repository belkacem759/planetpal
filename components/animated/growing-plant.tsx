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
    lg: 'w-20 h-24',
    md: 'w-16 h-20',
    sm: 'w-12 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 100 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pot */}
        <path
          className="opacity-90"
          d="M25 100 L75 100 L70 120 L30 120 Z"
          fill="#8B4513"
        />
        
        {/* Soil */}
        <ellipse
          cx="50"
          cy="100"
          fill="#654321"
          rx="25"
          ry="3"
        />
        
        {/* Stem */}
        <line
          className={`transition-all duration-2000 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          stroke="#228B22"
          strokeWidth="3"
          style={{
            strokeDasharray: '40',
            strokeDashoffset: isVisible ? '0' : '40',
            transitionDelay: `${delay}ms`
          }}
          x1="50"
          x2="50"
          y1="100"
          y2="60"
        />
        
        {/* Left leaf */}
        <path
          className={`transition-all duration-1500 ease-out transform origin-bottom ${
            isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-45'
          }`}
          d="M50 70 Q35 65 40 50 Q45 55 50 70"
          fill="#32CD32"
          style={{
            transitionDelay: `${delay + 800}ms`
          }}
        />
        
        {/* Right leaf */}
        <path
          className={`transition-all duration-1500 ease-out transform origin-bottom ${
            isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-45'
          }`}
          d="M50 70 Q65 65 60 50 Q55 55 50 70"
          fill="#32CD32"
          style={{
            transitionDelay: `${delay + 1200}ms`
          }}
        />
        
        {/* Flower */}
        <circle
          className={`transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          cx="50"
          cy="45"
          fill="#FF69B4"
          r="8"
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
          <circle cx="42" cy="40" fill="#FFB6C1" r="4" />
          <circle cx="58" cy="40" fill="#FFB6C1" r="4" />
          <circle cx="42" cy="50" fill="#FFB6C1" r="4" />
          <circle cx="58" cy="50" fill="#FFB6C1" r="4" />
          <circle cx="50" cy="37" fill="#FFB6C1" r="4" />
          <circle cx="50" cy="53" fill="#FFB6C1" r="4" />
        </g>
      </svg>
    </div>
  );
}

export function FloatingLeaf({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div className={`absolute ${className}`}>
      <svg
        className="w-6 h-4 animate-bounce"
        style={{
          animationDelay: `${delay}ms`,
          animationDuration: '3s'
        }}
        viewBox="0 0 30 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="opacity-70"
          d="M2 10 Q15 2 28 10 Q15 18 2 10"
          fill="#32CD32"
        />
        <line
          stroke="#228B22"
          strokeWidth="1"
          x1="2"
          x2="15"
          y1="10"
          y2="10"
        />
      </svg>
    </div>
  );
}