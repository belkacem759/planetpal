import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CareInstructions, Json } from "@/types/database";
import { motion } from "framer-motion";
import { Heart, Leaf, Star } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface ProductInfoCardProps {
  careInstructions?: CareInstructions | Json | null;
  category?: string;
  className?: string;
  description?: string;
  difficultyLevel?: string;
  id: string;
  images: { gallery?: string[]; main?: string; }
  isPlant?: boolean;
  name: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  slug: string;
  stockQuantity?: number;
}

const ProductInfoCard = React.forwardRef<HTMLDivElement, ProductInfoCardProps>(
  ({
    careInstructions,
    category,
    className,
    description,
    difficultyLevel,
    id,
    images,
    isPlant,
    name,
    price,
    rating,
    reviewCount,
    slug,
    stockQuantity = 0,
    ...props
  }, ref) => {
    const isOutOfStock = stockQuantity <= 0;

    // Calculate average care difficulty for plants
    const getAverageDifficulty = () => {
      if (!careInstructions || !isPlant) {return null;}

      const difficulties = Object.values(careInstructions).map(instruction => instruction.difficulty);
      if (difficulties.length === 0) {return null;}

      const average = difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length;
      return Math.round(average);
    };

    const avgDifficulty = getAverageDifficulty();

    // Render star rating
    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star
          className={cn(
            "h-4 w-4",
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
          )}
          key={i}
        />
      ));
    };

    return (
      <motion.div
        transition={{ damping: 20, stiffness: 300, type: "spring" }}
        whileHover={{ scale: 1.02, y: -4 }}
      >
        <Card
          className={cn(
            "group cursor-pointer transition-all hover:shadow-xl border-0 bg-card overflow-hidden",
            className
          )}
          ref={ref}
          {...props}
        >
          <Link href={`/products/${slug}`}>
            <CardContent className="p-0">
              {/* Image Section */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <motion.img
                  alt={name}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={images.main}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                />

                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {category && (
                    <Badge className="bg-background/90 text-foreground backdrop-blur-sm" variant="secondary">
                      {category}
                    </Badge>
                  )}
                  {isPlant && (difficultyLevel || avgDifficulty) && (
                    <Badge className="bg-green-100/90 text-green-700 border-green-200 dark:bg-green-950/90 dark:text-green-300 dark:border-green-800 backdrop-blur-sm" variant="outline">
                      <Leaf className="h-3 w-3 mr-1" />
                      {difficultyLevel || `Level ${avgDifficulty}/5`}
                    </Badge>
                  )}
                </div>

                {/* Stock status */}
                <div className="absolute top-3 right-3">
                  {isOutOfStock ? (
                    <Badge className="bg-red-500/90 backdrop-blur-sm" variant="destructive">
                      Out of Stock
                    </Badge>
                  ) : stockQuantity <= 5 ? (
                    <Badge className="bg-orange-100/90 text-orange-700 border-orange-200 dark:bg-orange-950/90 dark:text-orange-300 dark:border-orange-800 backdrop-blur-sm" variant="outline">
                      {stockQuantity} left
                    </Badge>
                  ) : null}
                </div>

                {/* Favorite icon */}
                <motion.div
                  className="absolute bottom-3 right-3 p-2 bg-background/90 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3">
                {/* Product name */}
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
                  {name}
                </h3>

                {/* Description */}
                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                )}

                {/* Rating */}
                {rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {rating.toFixed(1)}
                      {reviewCount && ` (${reviewCount})`}
                    </span>
                  </div>
                )}

                {/* Price and stock info */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${price.toFixed(2)}
                    </p>
                    {stockQuantity > 0 && stockQuantity <= 5 && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        Only {stockQuantity} left!
                      </p>
                    )}
                  </div>

                  {/* Eco-friendly indicator for plants */}
                  {isPlant && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Leaf className="h-4 w-4" />
                      <span className="text-xs font-medium">Eco-Friendly</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </motion.div>
    );
  }
);

ProductInfoCard.displayName = "ProductInfoCard";

export { ProductInfoCard };
export type { ProductInfoCardProps };
