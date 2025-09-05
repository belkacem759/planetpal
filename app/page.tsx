'use client';

import { useProductsQuery, useCategoriesQuery, useAddToCartMutation } from '@/hooks';
import { ProductGrid } from '@/components/organisms/product-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ArrowRight, Leaf, Recycle, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const { data: productsData, isLoading: productsLoading } = useProductsQuery({ limit: 8 });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery();
  const addToCartMutation = useAddToCartMutation();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const featuredProducts = productsData?.data || []
  const categories = categoriesData?.data || []

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    setAddingToCart(productId);
    try {
      await addToCartMutation.mutateAsync({ product_id: productId, quantity });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-green-600">PlanetPal</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover eco-friendly products that help you live sustainably while protecting our planet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PlanetPal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Eco-Friendly</h3>
              <p className="text-gray-600">
                All our products are sustainably sourced and environmentally responsible.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Recyclable Packaging</h3>
              <p className="text-gray-600">
                Our packaging is 100% recyclable and made from recycled materials.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Impact</h3>
              <p className="text-gray-600">
                Every purchase contributes to environmental conservation efforts worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          {categoriesLoading ? (
            <div className="flex justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories?.slice(0, 4).map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/categories/${category.slug}`}>
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 text-center">
                        {category.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/shop">
                View All Categories
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          {productsLoading ? (
            <div className="flex justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>
              <ProductGrid
                products={featuredProducts || []}
                onAddToCart={handleAddToCart}
                isAddingToCart={addingToCart}
              />
              <div className="text-center mt-8">
                <Button asChild size="lg">
                  <Link href="/shop">
                    View All Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Get the latest eco-friendly products and sustainability tips delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <Button className="bg-white text-green-600 hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
