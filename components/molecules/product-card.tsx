import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  difficultyLevel?: string;
  isPlant?: boolean;
  stockQuantity?: number;
  onAddToCart?: (productId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({
    id,
    name,
    slug,
    price,
    images,
    difficultyLevel,
    isPlant,
    stockQuantity = 0,
    onAddToCart,
    isLoading = false,
    className,
    ...props
  }, ref) => {
    const imageUrl = images?.[0] || "/placeholder-plant.jpg";
    const isOutOfStock = stockQuantity <= 0;

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isOutOfStock && onAddToCart) {
        onAddToCart(id);
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "group cursor-pointer transition-all hover:shadow-lg",
          className
        )}
        {...props}
      >
        <Link href={`/products/${slug}`}>
          <CardContent className="p-0">
            <div className="relative aspect-square overflow-hidden rounded-t-xl">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {isPlant && difficultyLevel && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 right-2"
                >
                  {difficultyLevel}
                </Badge>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{name}</h3>
              <p className="text-2xl font-bold text-primary">
                ${price.toFixed(2)}
              </p>
              {stockQuantity > 0 && stockQuantity <= 5 && (
                <p className="text-sm text-orange-600 mt-1">
                  Only {stockQuantity} left!
                </p>
              )}
            </div>
          </CardContent>
        </Link>
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            className="w-full"
            variant={isOutOfStock ? "outline" : "default"}
          >
            {isLoading ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
);
ProductCard.displayName = "ProductCard";

export { ProductCard };
export type { ProductCardProps };