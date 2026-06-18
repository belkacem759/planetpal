import * as React from "react";
import { CartItem } from "@/components/molecules/cart-item";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CartItemData {
  created_at: string;
  id: string;
  price: number;
  product: {
    id: string;
    images: {
      gallery: string[];
      main: string;
    };
    name: string;
    price: number;
    slug: string;
    stock_quantity: number;
  };
  product_id: string;
  quantity: number;
  updated_at: string;
}

interface CartListProps {
  className?: string;
  error?: Error | null;
  isCheckingOut?: boolean;
  isLoading?: boolean;
  isUpdating?: string | null; // itemId currently being updated
  items: CartItemData[];
  onCheckout?: () => void;
  onQuantityChange?: (itemId: string, newQuantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  showOrderSummary?: boolean;
}

const CartList = React.forwardRef<HTMLDivElement, CartListProps>(
  ({
    className,
    error = null,
    isCheckingOut = false,
    isLoading = false,
    isUpdating = null,
    items,
    onCheckout,
    onQuantityChange,
    onRemoveItem,
    showOrderSummary = true,
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
          className={cn(
            "flex items-center justify-center min-h-[300px]",
            className
          )}
          ref={ref}
          {...props}
        >
          <div className="text-center">
            <Spinner className="mb-4" size="lg" />
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div
          className={cn("min-h-[300px]", className)}
          ref={ref}
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
          className={cn(
            "flex items-center justify-center min-h-[400px]",
            className
          )}
          ref={ref}
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
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
    console.log(items)
    return (
      <div
        className={cn("space-y-6", className)}
        ref={ref}
        {...props}
      >
        {/* Cart Items */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                id={item.id}
                isUpdating={isUpdating === item.id}
                key={item.id}
                maxQuantity={item.product?.stock_quantity || 0}
                onQuantityChange={onQuantityChange || (() => { })}
                onRemove={onRemoveItem || (() => { })}
                price={item.product?.price || 0}
                productId={item.product_id}
                productImage={item.product?.images?.main || ''}
                productName={item.product?.name || 'Unknown Product'}
                productSlug={item.product?.slug || ''}
                quantity={item.quantity}
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
                    className="w-full"
                    disabled={isCheckingOut || items.length === 0}
                    onClick={onCheckout}
                    size="lg"
                  >
                    {isCheckingOut ? (
                      <>
                        <Spinner className="mr-2" size="sm" />
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
                <Link className="block" href="/products">
                  <Button className="w-full" variant="outline">
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