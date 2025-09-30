import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export function QuantitySelector({ 
  quantity, 
  onIncrement, 
  onDecrement, 
  onAddToCart, 
  isAddingToCart 
}: QuantitySelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDecrement}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onIncrement}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isAddingToCart ? 'Adding...' : `Add ${quantity} to Cart`}
        </Button>
      </CardContent>
    </Card>
  );
}