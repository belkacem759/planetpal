"use client"

import { useCategoriesQuery } from "@/hooks";
import { useRouter } from "next/navigation";

export default function CategoriesPage() {
  const { data: categories, error, isLoading } = useCategoriesQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading categories: {error.message}
        </div>
      </div>
    );
  }

  const categoriesArray = categories || [];

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/shop?categories=${encodeURIComponent(categorySlug)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>

      {categoriesArray.length === 0 ? (
        <div className="text-center text-gray-600">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesArray.map((category) => (
            <div
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
            >
              {
                category.image_url && (
                  <img
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                    src={category.image_url}
                  />
                )
              }
              < h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 mb-4">{category.description}</p>
              )}
              {category.products_count !== undefined && (
                <p className="text-sm text-gray-500">
                  {category.products_count} products
                </p>
              )}
            </div>
          ))}
        </div>
      )
      }
    </div >
  );
}