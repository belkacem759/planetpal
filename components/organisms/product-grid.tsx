import * as React from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductCard } from '@/components/molecules/product-card';
import { ProductCardSkeleton } from '@/components/molecules/product-card-skeleton';
import { Product } from '@/types/types';

interface ProductGridProps {
  className?: string;
  emptyMessage?: string;
  error?: Error | null;
  isAddingToCart?: string | null;
  isLoading?: boolean;
  onAddToCart?: (productId: string) => void;
  products: Product[];
  ref?: React.Ref<HTMLDivElement>;
}

const ProductGrid = React.memo(
  ({
    className,
    emptyMessage = 'No products found.',
    error = null,
    isAddingToCart = null,
    isLoading = false,
    onAddToCart,
    products,
    ref,
    ...props
  }: ProductGridProps) => {
    // Create skeleton cards
    const skeletonCards = Array(8)
      .fill(0)
      .map((_, index) => <ProductCardSkeleton key={index} />);

    // Create product cards
    const productCards =
      products?.map((product) => (
        <ProductCard
          careInstructions={product.care_instructions || undefined}
          difficultyLevel={product.difficulty_level ? String(product.difficulty_level) : undefined}
          id={product.id}
          images={product.images ?? { gallery: [], main: "" }}
          isLoading={isAddingToCart === product.id}
          isPlant={product.is_plant || undefined}
          key={product.id}
          name={product.name}
          onAddToCart={onAddToCart}
          price={product.price}
          slug={product.slug}
          stockQuantity={product.stock_quantity}
        />
      )) || [];

    // Loading state
    if (isLoading) {
      return (
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
            className
          )}
          ref={ref}
          {...props}
        >
          {skeletonCards}
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className={cn('min-h-[400px]', className)} ref={ref} {...props}>
          <Alert variant="destructive">
            <AlertDescription>
              {error.message || 'Failed to load products. Please try again.'}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Empty state
    if (!products || products.length === 0) {
      return (
        <div
          className={cn(
            'flex items-center justify-center min-h-[400px]',
            className
          )}
          ref={ref}
          {...props}
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      );
    }

    // Products grid
    return (
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
          className
        )}
        ref={ref}
        {...props}
      >
        {productCards}
      </div>
    );
  }
);

export { ProductGrid };
export type { Product, ProductGridProps };
