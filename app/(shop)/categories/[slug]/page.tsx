'use client';

import { FilterBar } from '@/components/molecules/filter-bar';
import { ProductGrid } from '@/components/organisms/product-grid';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAddToCartMutation } from '@/hooks/useCart';
import { useCategoryQuery } from '@/hooks/useCategories';
import { useProductsQuery } from '@/hooks/useProducts';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { Params } from '@/types/types';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

/**
 * Public Route: Accessible to all users
 * Dynamic category listing page
 */

export default function CategoryPage({
  params,
}: {
  params: Params
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { filters } = useUrlFilters();

  // Fetch category data
  const { data: categoryData } = useCategoryQuery(slug);
  // Fetch products for this category
  const { data: products, isLoading, error } = useProductsQuery({
    search: filters.search,
    category: categoryData?.id || "",
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    difficulty: filters.difficulty,
    isPlant: filters.isPlant,
    care_difficulty_water: filters.care_difficulty_water,
    care_difficulty_light: filters.care_difficulty_light,
    care_difficulty_humidity: filters.care_difficulty_humidity,
    care_difficulty_fertilizer: filters.care_difficulty_fertilizer,
    care_difficulty_temperature: filters.care_difficulty_temperature,
    max_care_difficulty: filters.max_care_difficulty,
    limit: 20,
    offset: 0
  });

  console.log({ categoryData, products })
  const addToCartMutation = useAddToCartMutation();

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      await addToCartMutation.mutateAsync({
        product_id: productId,
        quantity: 1,
      });
    } finally {
      setAddingToCart(null);
    }
  };





  if (!categoryData && products) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          Category &ldquo;{slug}&rdquo; not found.
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/shop')}
          className="mb-4"
        >
          ← Back to Shop
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          {categoryData?.name || slug}
        </h1>
        {categoryData?.description && (
          <p className="text-gray-600 mb-4">{categoryData.description}</p>
        )}
      </div>

      <FilterBar />

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          Failed to load products. Please try again.
        </Alert>
      )}

      {products && (
        <ProductGrid
          products={products?.data || []}
          onAddToCart={handleAddToCart}
          isAddingToCart={addingToCart}
        />
      )}

      {products && products.data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No products found in this category.</p>
          <Button onClick={() => router.push('/shop')}>Browse All Products</Button>
        </div>
      )}
    </div>
  );
}