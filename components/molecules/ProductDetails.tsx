"use client"
import { unstable_ViewTransition as ViewTransition } from 'react';

interface ProductDetailsProps {
  name: string;
  price: number;
  description?: string;
}

export function ProductDetails({ name, price, description }: ProductDetailsProps) {
  return (
    <div>
      <ViewTransition name={`title-${name}`}>
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