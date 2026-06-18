'use client';

import { startTransition, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ViewTransition } from '@/components/ui/view-transition';

import { Params } from '@/types/types';
import { useAddToCartMutation } from '@/hooks/useCart';
import { useProductQuery } from '@/hooks/useProducts';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ProductDetailsSkeleton } from '@/components/ui/product-skeleton';
import { ProductPageLayout } from '@/components/organisms/ProductPageLayout';

export default function ProductDetailsPage({ params }: { params: Params }) {
  const { slug } = use(params);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // Fetch product data
  const { data: product, error, isLoading } = useProductQuery(slug);

  const addToCartMutation = useAddToCartMutation();

  const handleAddToCart = async () => {
    if (!product) {return;}

    setIsAddingToCart(true);
    try {
      await addToCartMutation.mutateAsync({
        product_id: product.id,
        quantity,
      });
      // Optionally show success message or redirect to cart
    } finally {
      setIsAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  const handleBuyNow = () => {
    router.push('/checkout');
  };

  const handleBackToShop = () => {
    startTransition(() => {
      router.back();
    });
  };

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-6" variant="destructive">
          Failed to load product. Please try again.
        </Alert>
        <Button onClick={handleBackToShop}>Back to Shop</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-6" variant="destructive">
          Product "{slug}" not found.
        </Alert>
        <Button onClick={handleBackToShop}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <ViewTransition>
      <ProductPageLayout
        isAddingToCart={isAddingToCart}
        onAddToCart={handleAddToCart}
        onBackToShop={handleBackToShop}
        onBuyNow={handleBuyNow}
        onQuantityDecrement={decrementQuantity}
        onQuantityIncrement={incrementQuantity}
        onViewCart={handleViewCart}
        product={product}
        quantity={quantity}
      />
    </ViewTransition>
  );
}
