'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Skeleton } from "../ui/skeleton";

interface ProductCardSkeletonProps {
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const ProductCardSkeleton = React.memo(({ className, ref, ...props }: ProductCardSkeletonProps) => {
    return (
      <Card
        ref={ref}
        className={cn("overflow-hidden", className)}
        {...props}
      >
        <CardContent className="p-0">
          {/* Image skeleton */}
          <Skeleton className="aspect-square w-full rounded-t-xl" />
          
          <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Price skeleton */}
            <Skeleton className="h-8 w-1/3" />
            
            {/* Care instructions skeleton */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-2/3" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          {/* Button skeleton */}
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
});

ProductCardSkeleton.displayName = "ProductCardSkeleton";

export { ProductCardSkeleton };
export type { ProductCardSkeletonProps };