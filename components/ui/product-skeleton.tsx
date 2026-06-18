'use client';

import { Skeleton } from './skeleton';

export function ProductDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <Skeleton className="h-10 w-32 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image Skeleton */}
        <div className="aspect-square bg-gray-100 rounded-lg">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-6">
          <div>
            {/* Product title */}
            <Skeleton className="h-9 w-3/4 mb-2" />
            {/* Product price */}
            <Skeleton className="h-8 w-24 mb-4" />
            {/* Product description */}
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>

          {/* Product Attributes */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-16" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
          </div>

          {/* Stock info */}
          <Skeleton className="h-5 w-40" />
        </div>
      </div>

      {/* Care Instructions Section */}
      <div className="mt-12">
        <Skeleton className="h-7 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div className="bg-white p-4 rounded-lg border" key={i}>
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}