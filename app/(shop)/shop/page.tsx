'use client';

import { unstable_ViewTransition as ViewTransition } from 'react';
import { useAddToCartMutation, useProductsQuery, useUrlFilters } from '@/hooks';

import ShopLayout from '@/components/layouts/shop-layout';
import { FilterSidebar } from '@/components/molecules/filter-sidebar';
import { ProductGrid } from '@/components/organisms/product-grid';

/**
 * Public Route: Accessible to all users
 * Product grid with filters and search
 */
export default function ShopPage() {
  const { filters } = useUrlFilters();

  const {
    data: productsData,
    isLoading,
    error,
  } = useProductsQuery({
    search: filters.search,
    categories: filters.categories,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    difficulty: filters.difficulty || undefined,
    isPlant: filters.isPlant,
    care_difficulty_water: filters.care_difficulty_water || undefined,
    care_difficulty_light: filters.care_difficulty_light || undefined,
    care_difficulty_humidity: filters.care_difficulty_humidity || undefined,
    care_difficulty_fertilizer: filters.care_difficulty_fertilizer || undefined,
    care_difficulty_temperature:
      filters.care_difficulty_temperature || undefined,
    max_care_difficulty: filters.max_care_difficulty || undefined,
    limit: 20,
    offset: 0,
  });

  const products = productsData?.products || [];
  const addToCartMutation = useAddToCartMutation();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCartMutation.mutateAsync({
        product_id: productId,
        quantity: 1,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="container mx-auto px-0 md:px-4 py-8">
      <ViewTransition>
        <ShopLayout
          header={
            <div>
              <h1 className="text-3xl font-bold mb-4">Shop Plants</h1>
              <p className="text-gray-600 mb-6">
                Discover our collection of beautiful plants for your home and
                garden.
              </p>
            </div>
          }
          sidebar={<FilterSidebar />}
        >
          {/* Product Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            error={error ? new Error(error.message) : null}
            onAddToCart={handleAddToCart}
            isAddingToCart={addToCartMutation.isPending ? 'loading' : ''}
            emptyMessage="No plants found. Try adjusting your filters."
          />
        </ShopLayout>
      </ViewTransition>
    </div>
  );
}
