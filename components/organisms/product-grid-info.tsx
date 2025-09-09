import * as React from "react";
import { ProductInfoCard } from "@/components/molecules/product-info-card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Product } from "@/types/database";

interface ProductGridInfoProps {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  emptyMessage?: string;
}

const ProductGridInfo = React.forwardRef<HTMLDivElement, ProductGridInfoProps>(
  ({
    products,
    isLoading = false,
    error = null,
    className,
    emptyMessage = "No products found.",
    ...props
  }, ref) => {
    // Loading state
    if (isLoading) {
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
            <Spinner size="lg" className="mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
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

    // Products grid with info cards
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
          className
        )}
        {...props}
      >
        {products.map((product) => {
          // Handle images array from JSON
          const images = Array.isArray(product.images) 
            ? product.images as string[]
            : product.images 
            ? [product.images as string]
            : [];

          return (
            <ProductInfoCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              images={images}
              stockQuantity={product.stock_quantity}
              difficultyLevel={product.difficulty_level || undefined}
              isPlant={product.is_plant || undefined}
              description={product.description || undefined}
              careInstructions={product.care_instructions}
            />
          );
        })}
      </div>
    );
  }
);
ProductGridInfo.displayName = "ProductGridInfo";

export { ProductGridInfo };
export type { ProductGridInfoProps };