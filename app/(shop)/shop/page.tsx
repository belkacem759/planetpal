'use client';

import { FilterBar } from '@/components/molecules/filter-bar';
import { ProductGrid } from '@/components/organisms/product-grid';

import { useAddToCartMutation, useProductsQuery, useUrlFilters } from '@/hooks';

/**
 * Public Route: Accessible to all users
 * Product grid with filters and search
 */
export default function ShopPage() {
  const { filters } = useUrlFilters();
  
  const { data: productsData, isLoading, error } = useProductsQuery({
    search: filters.search,
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    difficulty: filters.difficulty,
    isPlant: filters.isPlant,
    limit: 20,
    offset: 0
  });
  

  
  const products = productsData?.products || [];

  const addToCartMutation = useAddToCartMutation();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCartMutation.mutateAsync({
        product_id: productId,
        quantity: 1
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Shop Plants</h1>
        <p className="text-gray-600 mb-6">
          Discover our collection of beautiful plants for your home and garden.
        </p>


      </div>

      <div className="space-y-8">
        {/* Filters */}
        <FilterBar />

        {/* Product Grid */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={error ? new Error(error.message) : null}
          onAddToCart={handleAddToCart}
          isAddingToCart={addToCartMutation.isPending ? 'loading' : ''}
          emptyMessage="No plants found. Try adjusting your filters."
        />
      </div>
    </div>
  );
}