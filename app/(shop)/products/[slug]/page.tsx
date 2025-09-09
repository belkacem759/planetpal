'use client';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAddToCartMutation } from '@/hooks/useCart';
import { useProductQuery } from '@/hooks/useProducts';
import { CareInstructions } from '@/types/database';
import { Params } from '@/types/types';
import { Droplets, Leaf, Minus, Plus, ShoppingCart, Sun, Thermometer, Wind } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';


export default function ProductDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = use(params)
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Care instruction icons mapping
  const careIcons = {
    water: Droplets,
    light: Sun,
    temperature: Thermometer,
    fertilizer: Leaf,
    humidity: Wind,
  };

  // Difficulty level colors
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-green-100 text-green-800";
    if (difficulty <= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Render care instructions
  const renderCareInstructions = (careInstructions: any) => {
    const careTypes = ['water', 'light', 'humidity', 'fertilizer', 'temperature'];

    return careTypes.map((type) => {
      const IconComponent = careIcons[type as keyof typeof careIcons];
      if (!IconComponent) return null;

      const instructionText = careInstructions[type];
      const difficultyKey = `${type}_difficulty`;
      const difficulty = careInstructions[difficultyKey];

      // Skip if no instruction text or difficulty
      if (!instructionText || difficulty === undefined) return null;

      return (
        <div key={type} className="flex items-start space-x-3 p-3 rounded-lg border">
          <IconComponent className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium capitalize">{type}</h4>
              <Badge className={getDifficultyColor(difficulty)}>
                {difficulty}/5
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{instructionText}</p>
          </div>
        </div>
      );
    });
  };

  // Fetch all products to find the one with matching slug
  const { data: product, isLoading, error } = useProductQuery(slug);

  const addToCartMutation = useAddToCartMutation();

  const handleAddToCart = async () => {
    if (!product) return;

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
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          Failed to load product. Please try again.
        </Alert>
        <Button onClick={() => router.push('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          Product "{slug}" not found.
        </Alert>
        <Button onClick={() => router.push('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="outline"
        onClick={() => router.push('/shop')}
        className="mb-6"
      >
        ← Back to Shop
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          {Array.isArray(product.images) && product.images.length > 0 ? (
            <img
              src={(product.images as string[])[0] || '/placeholder.jpg'}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">📦</div>
              <p>No image available</p>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold text-green-600 mb-4">
              ${product?.price?.toFixed(2)}
            </p>
            {product.description && (
              <p className="text-gray-600 mb-4">{product.description}</p>
            )}
          </div>

          {/* Product Attributes */}
          <div className="space-y-2">
            {product.difficulty_level && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Difficulty:</span>
                <Badge variant="secondary">{product.difficulty_level}</Badge>
              </div>
            )}

            {/* Care Instructions Section */}
            {product.is_plant && product.care_instructions && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Care Instructions</h3>
                <div className="space-y-3">
                  {renderCareInstructions(product.care_instructions)}
                </div>
              </div>
            )}
            {product.category_id && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Category:</span>
                <Badge variant="outline">{product.category_id}</Badge>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isAddingToCart ? 'Adding...' : `Add ${quantity} to Cart`}
              </Button>
            </CardContent>
          </Card>

          {/* Additional Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/cart')}
              className="flex-1"
            >
              View Cart
            </Button>
            <Button
              onClick={() => router.push('/checkout')}
              className="flex-1"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}