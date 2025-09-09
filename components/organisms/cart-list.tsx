import * as React from "react";
import { CartItem } from "@/components/molecules/cart-item";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CartItemData {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

interface CartListProps {
  items: CartItemData[];
  isLoading?: boolean;
  error?: Error | null;
  onQuantityChange?: (itemId: string, newQuantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  isUpdating?: string | null; // itemId currently being updated
  className?: string;
  showOrderSummary?: boolean;
  onCheckout?: () => void;
  isCheckingOut?: boolean;
}

const CartList = React.forwardRef<HTMLDivElement, CartListProps>(
  ({
    items,
    isLoading = false,
    error = null,
    onQuantityChange,
    onRemoveItem,
    isUpdating = null,
    className,
    showOrderSummary = true,
    onCheckout,
    isCheckingOut = false,
    ...props
  }, ref) => {
    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    // Loading state
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center min-h-[300px]",
            className
          )}
          {...props}
        >
          <div className="text-center">
            <Spinner size="lg" className="mb-4" />
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div
          ref={ref}
          className={cn("min-h-[300px]", className)}
          {...props}
        >
          <Alert variant="destructive">
            <AlertDescription>
              {error.message || "Failed to load cart. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Empty cart state
    if (!items || items.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center min-h-[400px]",
            className
          )}
          {...props}
        >
          <div className="text-center max-w-md">
            <svg
              className="mx-auto h-16 w-16 text-muted-foreground mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4"
              />
            </svg>
            <h3 className="text-xl font-semibold mb-3">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any plants to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("space-y-6", className)}
        {...props}
      >
        {/* Cart Items */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                id={item.id}
                productId={item.product_id}
                productName={item.product?.name || 'Unknown Product'}
                productSlug={item.product?.slug || ''}
                productImage={item.product?.image_url || ''}
                price={item.product?.price || 0}
                quantity={item.quantity}
                maxQuantity={item.product?.stock_quantity || 0}
                onQuantityChange={onQuantityChange || (() => {})}
                onRemove={onRemoveItem || (() => {})}
                isUpdating={isUpdating === item.id}
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        {showOrderSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {subtotal < 50 && shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              {onCheckout && (
                <div className="pt-4">
                  <Button
                    onClick={onCheckout}
                    disabled={isCheckingOut || items.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isCheckingOut ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                </div>
              )}

              {/* Continue Shopping */}
              <div className="pt-2">
                <Link href="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);
CartList.displayName = "CartList";

export { CartList };
export type { CartListProps, CartItemData };