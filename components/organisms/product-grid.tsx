import { ProductCard } from "@/components/molecules/product-card";
import { ProductCardSkeleton } from "@/components/molecules/product-card-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Product } from "@/types/database";
import * as React from "react";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  onAddToCart?: (productId: string) => void;
  isAddingToCart?: string | null;
  className?: string;
  emptyMessage?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const ProductGrid = React.memo(({
  products,
  isLoading = false,
  error = null,
  onAddToCart,
  isAddingToCart = null,
  className,
  emptyMessage = "No products found.",
  ref,
  ...props
}: ProductGridProps) => {
    // Create skeleton cards
    const skeletonCards = Array(8).fill(0).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ));

    // Create product cards
  const productCards = products?.map((product) => (
    <ProductCard
      key={product.id}
      id={product.id}
      name={product.name}
      slug={product.slug}
      price={product.price}
      images={product.images}
      stockQuantity={product.stock_quantity}
      difficultyLevel={product.difficulty_level || undefined}
      isPlant={product.is_plant || undefined}
      onAddToCart={onAddToCart}
      isLoading={isAddingToCart === product.id}
      careInstructions={product.care_instructions || undefined}
    />
  )) || [];

    // Loading state
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6",
            className
          )}
          {...props}
        >
          {skeletonCards}
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div
          ref={ref}
          className={cn("min-h-[400px]", className)}
          {...props}
        >
          <Alert variant="destructive">
            <AlertDescription>
              {error.message || "Failed to load products. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Empty state
    if (!products || products.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center min-h-[400px]",
            className
          )}
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
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
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
        ref={ref}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6",
          className
        )}
        {...props}
      >
        {productCards}
      </div>
    );
});

export { ProductGrid };
export type { Product, ProductGridProps };
