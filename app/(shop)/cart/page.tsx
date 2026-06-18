'use client';

/**
 * Protected Route: Authenticated users only
 * User's cart, quantity edit, remove/add, proceed to checkout
 */

import { CartList } from '@/components/organisms/cart-list';
import { useCartQuery, useRemoveFromCartMutation, useUpdateCartItemMutation } from '@/hooks';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';

function CartPageContent() {
  const router = useRouter();
  const { data: cart, error, isLoading } = useCartQuery();
  const updateCartItemMutation = useUpdateCartItemMutation();
  const removeFromCartMutation = useRemoveFromCartMutation();

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      startTransition(() => {
        updateCartItemMutation.mutateAsync({
          item_id: itemId,
          quantity
        });
      });
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      startTransition(() => {
        removeFromCartMutation.mutateAsync(itemId);
      });
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-600">
          Review your items and proceed to checkout when ready.
        </p>
      </div>

      <CartList
        error={error ? new Error(error.message) : null}
        isCheckingOut={false}
        isLoading={isLoading}
        isUpdating={updateCartItemMutation.isPending || removeFromCartMutation.isPending ? 'updating' : null}
        items={(cart?.items) || []}
        onCheckout={handleCheckout}
        onQuantityChange={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}

export default function CartPage() {
  return (
    <CartPageContent />
  );
}