import { Button } from '@/components/ui/button';

interface ProductActionsProps {
  onBuyNow: () => void;
  onViewCart: () => void;
}

export function ProductActions({ onBuyNow, onViewCart }: ProductActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        className="flex-1"
        onClick={onViewCart}
        variant="outline"
      >
        View Cart
      </Button>
      <Button
        className="flex-1"
        onClick={onBuyNow}
      >
        Buy Now
      </Button>
    </div>
  );
}