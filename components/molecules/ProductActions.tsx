import { Button } from '@/components/ui/button';

interface ProductActionsProps {
  onViewCart: () => void;
  onBuyNow: () => void;
}

export function ProductActions({ onViewCart, onBuyNow }: ProductActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onViewCart}
        className="flex-1"
      >
        View Cart
      </Button>
      <Button
        onClick={onBuyNow}
        className="flex-1"
      >
        Buy Now
      </Button>
    </div>
  );
}