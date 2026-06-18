"use client"
import { ViewTransition } from '@/components/ui/view-transition';

interface ProductDetailsProps {
  description?: string;
  name: string;
  price: number;
  slug: string
}

export function ProductDetails({ description, name, price, slug }: ProductDetailsProps) {
  return (
    <div>
      <ViewTransition name={`title-${slug}`}>
        <h1
          className="text-3xl font-bold mb-2"
        >
          {name}
        </h1>
      </ViewTransition>
      <p className="text-2xl font-semibold text-green-600 mb-4">
        ${price?.toFixed(2)}
      </p>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
    </div>
  );
}