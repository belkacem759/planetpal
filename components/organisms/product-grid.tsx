import * as React from "react";
import { ProductCard } from "@/components/molecules/product-card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Product } from "@/hooks/useProducts";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  onAddToCart?: (productId: string) => void;
  isAddingToCart?: string | null; // productId currently being added
  className?: string;
  emptyMessage?: string;
}

const ProductGrid = React.forwardRef<HTMLDivElement, ProductGridProps>(
  ({
    products,
    isLoading = false,
    error = null,
    onAddToCart,
    isAddingToCart = null,
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

    // Products grid
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
          className
        )}
        {...props}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            images={[product.image_url]}
            stockQuantity={product.stock_quantity}
            difficultyLevel={product.difficulty_level}
            isPlant={product.is_plant}
            onAddToCart={onAddToCart}
            isLoading={isAddingToCart === product.id}
          />
        ))}
      </div>
    );
  }
);
ProductGrid.displayName = "ProductGrid";

export { ProductGrid };
export type { ProductGridProps, Product };