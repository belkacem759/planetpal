import { ProductInfoCard } from "@/components/molecules/product-info-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Product } from "@/types/types";
import * as React from "react";

interface ProductGridInfoProps {
  className?: string;
  emptyMessage?: string;
  error?: Error | null;
  isLoading?: boolean;
  products: Product[];
}

const ProductGridInfo = React.forwardRef<HTMLDivElement, ProductGridInfoProps>(
  ({
    className,
    emptyMessage = "No products found.",
    error = null,
    isLoading = false,
    products,
    ...props
  }, ref) => {
    // Loading state
    if (isLoading) {
      return (
        <div
          className={cn(
            "flex items-center justify-center min-h-[400px]",
            className
          )}
          ref={ref}
          {...props}
        >
          <div className="text-center">
            <Spinner className="mb-4" size="lg" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div
          className={cn("min-h-[400px]", className)}
          ref={ref}
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
          className={cn(
            "flex items-center justify-center min-h-[400px]",
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

    // Products grid with info cards
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
          className
        )}
        ref={ref}
        {...props}
      >
        {products.map((product) => (
          <ProductInfoCard
            careInstructions={product.care_instructions}
            description={product.description || undefined}
            difficultyLevel={product.difficulty_level ? String(product.difficulty_level) : undefined}
            id={product.id}
            images={product.images ?? { gallery: [], main: "" }}
            isPlant={product.is_plant || undefined}
            key={product.id}
            name={product.name}
            price={product.price}
            slug={product.slug}
            stockQuantity={product.stock_quantity}
          />
        ))}
      </div>
    );
  }
);
ProductGridInfo.displayName = "ProductGridInfo";

export { ProductGridInfo };
export type { ProductGridInfoProps };
