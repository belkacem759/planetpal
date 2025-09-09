'use client';

import { FloatingLeaf } from './growing-plant';

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating leaves */}
      <FloatingLeaf className="top-20 left-10" delay={0} />
      <FloatingLeaf className="top-32 right-20" delay={1000} />
      <FloatingLeaf className="top-48 left-1/4" delay={2000} />
      <FloatingLeaf className="top-16 right-1/3" delay={3000} />
      <FloatingLeaf className="top-40 left-3/4" delay={1500} />
      
      {/* Floating circles */}
      <div className="absolute top-24 left-16 w-2 h-2 bg-green-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-36 right-24 w-3 h-3 bg-blue-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-52 left-1/3 w-2 h-2 bg-purple-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '2.5s' }} />
      <div className="absolute top-20 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '3.5s' }} />
    </div>
  );
}

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-yellow-200 to-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
    </div>
  );
}