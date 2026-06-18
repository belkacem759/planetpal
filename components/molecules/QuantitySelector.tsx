import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface QuantitySelectorProps {
  isAddingToCart: boolean;
  onAddToCart: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  quantity: number;
}

export function QuantitySelector({ 
  isAddingToCart, 
  onAddToCart, 
  onDecrement, 
  onIncrement, 
  quantity 
}: QuantitySelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center gap-2">
            <Button
              disabled={quantity <= 1}
              onClick={onDecrement}
              size="sm"
              variant="outline"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              onClick={onIncrement}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={isAddingToCart}
          onClick={onAddToCart}
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isAddingToCart ? 'Adding...' : `Add ${quantity} to Cart`}
        </Button>
      </CardContent>
    </Card>
  );
}