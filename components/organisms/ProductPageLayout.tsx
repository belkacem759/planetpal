import { ProductImage } from '@/components/atoms/ProductImage';
import CareInstructions from '@/components/molecules/CareInstructions';
import { ProductActions } from '@/components/molecules/ProductActions';
import ProductAttributes from '@/components/molecules/ProductAttributes';
import { ProductDetails } from '@/components/molecules/ProductDetails';
import { QuantitySelector } from '@/components/molecules/QuantitySelector';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/types';

interface ProductPageLayoutProps {
  isAddingToCart: boolean;
  onAddToCart: () => void;
  onBackToShop: () => void;
  onBuyNow: () => void;
  onQuantityDecrement: () => void;
  onQuantityIncrement: () => void;
  onViewCart: () => void;
  product: Product;
  quantity: number;
}

export function ProductPageLayout({
  isAddingToCart,
  onAddToCart,
  onBackToShop,
  onBuyNow,
  onQuantityDecrement,
  onQuantityIncrement,
  onViewCart,
  product,
  quantity,
}: ProductPageLayoutProps) {

  return (
    <div className="container mx-auto p-6">
      <Button
        className="mb-6"
        onClick={onBackToShop}
        variant="outline"
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
            description={product.description || undefined}
            name={product.name}
            price={product.price}
            slug={product.slug}
          />

          <ProductAttributes
            categoryId={product.categoryId}
            categoryName={product?.category?.name}
            categorySlug={product?.category?.slug}
            difficultyLevel={product.difficulty_level}
          />

          <CareInstructions
            careInstructions={product.care_instructions}
            isPlant={product.is_plant}
          />

          <QuantitySelector
            isAddingToCart={isAddingToCart}
            onAddToCart={onAddToCart}
            onDecrement={onQuantityDecrement}
            onIncrement={onQuantityIncrement}
            quantity={quantity}
          />

          <ProductActions
            onBuyNow={onBuyNow}
            onViewCart={onViewCart}
          />
        </div>
      </div>
    </div>
  );
}