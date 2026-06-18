'use client';

import { ViewTransition } from '@/components/ui/view-transition';
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
    error,
    isLoading,
  } = useProductsQuery({
    care_difficulty_fertilizer: filters.care_difficulty_fertilizer || undefined,
    care_difficulty_humidity: filters.care_difficulty_humidity || undefined,
    care_difficulty_light: filters.care_difficulty_light || undefined,
    care_difficulty_temperature:
      filters.care_difficulty_temperature || undefined,
    care_difficulty_water: filters.care_difficulty_water || undefined,
    categories: filters.categories,
    difficulty: filters.difficulty || undefined,
    isPlant: filters.isPlant,
    limit: 20,
    max_care_difficulty: filters.max_care_difficulty || undefined,
    maxPrice: filters.maxPrice,
    minPrice: filters.minPrice,
    offset: 0,
    search: filters.search,
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
            emptyMessage="No plants found. Try adjusting your filters."
            error={error ? new Error(error.message) : null}
            isAddingToCart={addToCartMutation.isPending ? 'loading' : ''}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
            products={products}
          />
        </ShopLayout>
      </ViewTransition>
    </div>
  );
}
