'use client';

/**
 * Protected Route: Authenticated users only
 * User's cart, quantity edit, remove/add, proceed to checkout
 */

import { WithAuth } from '@/providers/auth/withAuth';
import { CartList } from '@/components/organisms/cart-list';
import { useCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@/hooks';
import { useRouter } from 'next/navigation';

function CartPageContent() {
  const router = useRouter();
  const { data: cart, isLoading, error } = useCartQuery();
  const updateCartItemMutation = useUpdateCartItemMutation();
  const removeFromCartMutation = useRemoveFromCartMutation();

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItemMutation.mutateAsync({
        item_id: itemId,
        quantity
      });
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCartMutation.mutateAsync(itemId);
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
        items={cart?.items || []}
        isLoading={isLoading}
        error={error ? new Error(error.message) : null}
        onQuantityChange={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isUpdating={updateCartItemMutation.isPending || removeFromCartMutation.isPending ? 'updating' : null}
        isCheckingOut={false}
      />
    </div>
  );
}

export default function CartPage() {
  return (
    <WithAuth>
      <CartPageContent />
    </WithAuth>
  );
}