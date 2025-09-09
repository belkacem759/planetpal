"use client"

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ShopLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <DotLottieReact
          src="https://lottie.host/1dc2dec2-6743-4838-a6f9-31c390a6721f/TImjnFR71L.lottie"
          loop
          autoplay
          className="w-32 h-32"
        />
        <p className="text-muted-foreground animate-pulse">Loading your plants...</p>
      </div>
    </div>
  );
};

export default ShopLoading;