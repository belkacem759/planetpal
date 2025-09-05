'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsQuery } from '@/hooks/useProducts';
import { useCategoriesQuery, useCategoryQuery } from '@/hooks/useCategories';
import { useAddToCartMutation } from '@/hooks/useCart';
import { ProductGrid } from '@/components/organisms/product-grid';
import { FilterBar } from '@/components/molecules/filter-bar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Params } from '@/types/types';

/**
 * Public Route: Accessible to all users
 * Dynamic category listing page
 */

export default function CategoryPage({
  params,
}: {
  params: Params
}) {
  const router = useRouter();
  const { slug } = use(params)
  const [search, setSearch] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Fetch category data
  const { data: categoryData } = useCategoryQuery(slug);
  // Fetch products for this category
  const { data: products, isLoading, error } = useProductsQuery({
    search,
    category: categoryData?.data.id || "",
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
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