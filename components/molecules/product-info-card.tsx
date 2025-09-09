import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CareInstructions, Json } from "@/types/database";
import { motion } from "framer-motion";
import { Heart, Leaf, Star } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface ProductInfoCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  description?: string;
  difficultyLevel?: string;
  isPlant?: boolean;
  stockQuantity?: number;
  careInstructions?: CareInstructions | Json | null;
  rating?: number;
  reviewCount?: number;
  category?: string;
  className?: string;
}

const ProductInfoCard = React.forwardRef<HTMLDivElement, ProductInfoCardProps>(
  ({
    id,
    name,
    slug,
    price,
    images,
    description,
    difficultyLevel,
    isPlant,
    stockQuantity = 0,
    careInstructions,
    rating,
    reviewCount,
    category,
    className,
    ...props
  }, ref) => {
    const imageUrl = images?.[0] || "/placeholder-plant.jpg";
    const isOutOfStock = stockQuantity <= 0;

    // Calculate average care difficulty for plants
    const getAverageDifficulty = () => {
      if (!careInstructions || !isPlant) return null;

      const difficulties = Object.values(careInstructions).map(instruction => instruction.difficulty);
      if (difficulties.length === 0) return null;

      const average = difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length;
      return Math.round(average);
    };

    const avgDifficulty = getAverageDifficulty();

    // Render star rating
    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ));
    };

    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card
          ref={ref}
          className={cn(
            "group cursor-pointer transition-all hover:shadow-xl border-0 bg-white overflow-hidden",
            className
          )}
          {...props}
        >
          <Link href={`/products/${slug}`}>
            <CardContent className="p-0">
              {/* Image Section */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <motion.img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {category && (
                    <Badge variant="secondary" className="bg-white/90 text-gray-700 backdrop-blur-sm">
                      {category}
                    </Badge>
                  )}
                  {isPlant && (difficultyLevel || avgDifficulty) && (
                    <Badge variant="outline" className="bg-green-100/90 text-green-700 border-green-200 backdrop-blur-sm">
                      <Leaf className="h-3 w-3 mr-1" />
                      {difficultyLevel || `Level ${avgDifficulty}/5`}
                    </Badge>
                  )}
                </div>

                {/* Stock status */}
                <div className="absolute top-3 right-3">
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm">
                      Out of Stock
                    </Badge>
                  ) : stockQuantity <= 5 ? (
                    <Badge variant="outline" className="bg-orange-100/90 text-orange-700 border-orange-200 backdrop-blur-sm">
                      {stockQuantity} left
                    </Badge>
                  ) : null}
                </div>

                {/* Favorite icon */}
                <motion.div
                  className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
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
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                )}

                {/* Rating */}
                {rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {rating.toFixed(1)}
                      {reviewCount && ` (${reviewCount})`}
                    </span>
                  </div>
                )}

                {/* Price and stock info */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      ${price.toFixed(2)}
                    </p>
                    {stockQuantity > 0 && stockQuantity <= 5 && (
                      <p className="text-xs text-orange-600 font-medium">
                        Only {stockQuantity} left!
                      </p>
                    )}
                  </div>
                  
                  {/* Eco-friendly indicator for plants */}
                  {isPlant && (
                    <div className="flex items-center gap-1 text-green-600">
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