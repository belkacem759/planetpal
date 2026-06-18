import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

interface CartItemProps {
  className?: string;
  id: string;
  isUpdating?: boolean;
  maxQuantity?: number;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  price: number;
  productId: string;
  productImage: string;
  productName: string;
  productSlug: string;
  quantity: number;
}

const CartItem = React.forwardRef<HTMLDivElement, CartItemProps>(
  ({
    className,
    id,
    isUpdating = false,
    maxQuantity = 99,
    onQuantityChange,
    onRemove,
    price,
    productId,
    productImage,
    productName,
    productSlug,
    quantity,
    ...props
  }, ref) => {
    const [localQuantity, setLocalQuantity] = React.useState(quantity.toString());
    const [isEditing, setIsEditing] = React.useState(false);

    // Update local quantity when prop changes
    React.useEffect(() => {
      setLocalQuantity(quantity.toString());
    }, [quantity]);

    const handleQuantityDecrease = () => {
      if (quantity > 1) {
        onQuantityChange(id, quantity - 1);
      }
    };

    const handleQuantityIncrease = () => {
      if (quantity < maxQuantity) {
        onQuantityChange(id, quantity + 1);
      }
    };

    const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalQuantity(value);
    };

    const handleQuantityInputBlur = () => {
      const numValue = Number.parseInt(localQuantity, 10);
      if (isNaN(numValue) || numValue < 1) {
        setLocalQuantity("1");
        onQuantityChange(id, 1);
      } else if (numValue > maxQuantity) {
        setLocalQuantity(maxQuantity.toString());
        onQuantityChange(id, maxQuantity);
      } else if (numValue !== quantity) {
        onQuantityChange(id, numValue);
      }
      setIsEditing(false);
    };

    const handleQuantityInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleQuantityInputBlur();
      } else if (e.key === "Escape") {
        setLocalQuantity(quantity.toString());
        setIsEditing(false);
      }
    };

    const handleRemove = () => {
      onRemove(id);
    };

    const subtotal = price * quantity;

    return (
      <Card
        className={cn(
          "transition-opacity",
          isUpdating && "opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <Link className="shrink-0" href={`/products/${productSlug}`}>
              <div className="relative w-20 h-20 rounded-md overflow-hidden">
                <img
                  alt={productName}
                  // fill
                  className="object-cover"
                  sizes="80px"
                  src={productImage || "/placeholder-plant.jpg"}
                />
              </div>
            </Link>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <Link
                className="hover:text-primary transition-colors"
                href={`/products/${productSlug}`}
              >
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                  {productName}
                </h3>
              </Link>
              <p className="text-lg font-bold text-primary mb-2">
                ${price.toFixed(2)} each
              </p>
              <p className="text-sm text-muted-foreground">
                Subtotal: ${subtotal.toFixed(2)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Button
                  className="h-8 w-8"
                  disabled={quantity <= 1 || isUpdating}
                  onClick={handleQuantityDecrease}
                  size="icon"
                  variant="outline"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      fillRule="evenodd"
                    />
                  </svg>
                </Button>

                {isEditing ? (
                  <Input
                    autoFocus
                    className="w-16 h-8 text-center"
                    max={maxQuantity}
                    min="1"
                    onBlur={handleQuantityInputBlur}
                    onChange={handleQuantityInputChange}
                    onKeyDown={handleQuantityInputKeyDown}
                    type="number"
                    value={localQuantity}
                  />
                ) : (
                  <button
                    className="w-16 h-8 text-center border rounded-md hover:bg-accent transition-colors"
                    disabled={isUpdating}
                    onClick={() => setIsEditing(true)}
                  >
                    {quantity}
                  </button>
                )}

                <Button
                  className="h-8 w-8"
                  disabled={quantity >= maxQuantity || isUpdating}
                  onClick={handleQuantityIncrease}
                  size="icon"
                  variant="outline"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      fillRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>

              {/* Remove Button */}
              <Button
                className="text-xs"
                disabled={isUpdating}
                onClick={handleRemove}
                size="sm"
                variant="destructive"
              >
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
CartItem.displayName = "CartItem";

export { CartItem };
export type { CartItemProps };
