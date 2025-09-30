interface ProductImageProps {
  images: any;
  name: string;
  productId: string;
  className?: string;
}

export function ProductImage({ images, name, productId, className = "" }: ProductImageProps) {
  const renderImage = () => {
    // Handle nested object structure with main and gallery
    if (images && typeof images === 'object' && images.main) {
      return (
        <img
          src={images.main || '/placeholder.jpg'}
          alt={name}
          width={400}
          height={400}
          className={`w-full h-full object-cover rounded-lg ${className}`}
          style={{ viewTransitionName: `product-image-${productId}` }}
        />
      );
    }
    
    // Handle array structure
    if (Array.isArray(images) && images.length > 0) {
      return (
        <img
          src={images[0] || '/placeholder.jpg'}
          alt={name}
          width={400}
          height={400}
          className={`w-full h-full object-cover rounded-lg ${className}`}
          style={{ viewTransitionName: `product-image-${productId}` }}
        />
      );
    }
    
    // Fallback for no image
    return (
      <div className="text-gray-400 text-center">
        <div className="text-4xl mb-2">📦</div>
        <p>No image available</p>
      </div>
    );
  };

  return (
    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
      {renderImage()}
    </div>
  );
}