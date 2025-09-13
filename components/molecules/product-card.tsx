import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CareInstructions, Json } from "@/types/database";
import Link from "next/link";
import * as React from "react";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { main: string; gallery: string[] };
  difficultyLevel?: string;
  isPlant?: boolean;
  stockQuantity?: number;
  careInstructions?: CareInstructions | Json | null;
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
    careInstructions,
    onAddToCart,
    isLoading = false,
    className,
    ...props
  }, ref) => {
    // Handle both new JSON structure and legacy array format

    const { main = "", gallery = [] } = images;
    const isOutOfStock = stockQuantity <= 0;
    console.log(images);
    // Calculate average care difficulty for plants
    const getAverageDifficulty = () => {
      if (!careInstructions || !isPlant) return null;

      try {
        // Handle both CareInstructions object and raw Json data
        const instructions = typeof careInstructions === 'string'
          ? JSON.parse(careInstructions)
          : careInstructions;

        if (!instructions || typeof instructions !== 'object') return null;

        const difficulties = Object.values(instructions)
          .map((instruction: any) => instruction?.difficulty)
          .filter(difficulty => typeof difficulty === 'number' && difficulty >= 1 && difficulty <= 5);

        if (difficulties.length === 0) return null;

        const average = difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length;
        return Math.round(average);
      } catch (error) {
        console.warn('Error parsing care instructions:', error);
        return null;
      }
    };

    const avgDifficulty = getAverageDifficulty();

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
              <img
                src={images.main}
                alt={name}
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {isPlant && (difficultyLevel || avgDifficulty) && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 right-2"
                >
                  {difficultyLevel || `Difficulty: ${avgDifficulty}/5`}
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
              {careInstructions && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-foreground">Care Instructions:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {(() => {
                      try {
                        let instructions = careInstructions;
                        if (typeof instructions === 'string') {
                          instructions = JSON.parse(instructions);
                        }
                        if (instructions && typeof instructions === 'object') {
                          return Object.entries(instructions)
                            .filter(([key, value]) => value && typeof value === 'object' && 'text' in value)
                            .slice(0, 2)
                            .map(([key, instruction]: [string, any]) => (
                              <div key={key} className="flex justify-between items-center">
                                <span className="capitalize">{key.replace('_', ' ')}:</span>
                                <span className="text-right flex-1 ml-2 truncate">{instruction.text}</span>
                                {instruction.difficulty && (
                                  <Badge variant="outline" className="ml-1 text-xs px-1 py-0">
                                    {instruction.difficulty}/5
                                  </Badge>
                                )}
                              </div>
                            ));
                        }
                      } catch (error) {
                        console.error('Error parsing care instructions:', error);
                      }
                      return null;
                    })()}
                  </div>
                </div>
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
