import { ProductImage } from '@/components/atoms/ProductImage';
import CareInstructions from '@/components/molecules/CareInstructions';
import { ProductActions } from '@/components/molecules/ProductActions';
import ProductAttributes from '@/components/molecules/ProductAttributes';
import { ProductDetails } from '@/components/molecules/ProductDetails';
import { QuantitySelector } from '@/components/molecules/QuantitySelector';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/types';

interface ProductPageLayoutProps {
  product: Product;
  quantity: number;
  isAddingToCart: boolean;
  onQuantityIncrement: () => void;
  onQuantityDecrement: () => void;
  onAddToCart: () => void;
  onViewCart: () => void;
  onBuyNow: () => void;
  onBackToShop: () => void;
}

export function ProductPageLayout({
  product,
  quantity,
  isAddingToCart,
  onQuantityIncrement,
  onQuantityDecrement,
  onAddToCart,
  onViewCart,
  onBuyNow,
  onBackToShop,
}: ProductPageLayoutProps) {

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="outline"
        onClick={onBackToShop}
        className="mb-6"
      >
        ← Back to Shop
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <ProductImage
          images={product.images}
          name={product.name}
          slug={product.slug}
        />

        {/* Product Details */}
        <div className="space-y-6">
          <ProductDetails
            slug={product.slug}
            name={product.name}
            price={product.price}
            description={product.description || undefined}
          />

          <ProductAttributes
            difficultyLevel={product.difficulty_level}
            categoryId={product.categoryId}
            categoryName={product?.category?.name}
            categorySlug={product?.category?.slug}
          />

          <CareInstructions
            careInstructions={product.care_instructions}
            isPlant={product.is_plant}
          />

          <QuantitySelector
            quantity={quantity}
            onIncrement={onQuantityIncrement}
            onDecrement={onQuantityDecrement}
            onAddToCart={onAddToCart}
            isAddingToCart={isAddingToCart}
          />

          <ProductActions
            onViewCart={onViewCart}
            onBuyNow={onBuyNow}
          />
        </div>
      </div>
    </div>
  );
}