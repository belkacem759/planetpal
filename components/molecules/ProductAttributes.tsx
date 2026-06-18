import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface ProductAttributesProps {
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  difficultyLevel?: number;
}

export function ProductAttributes({ categoryId, categoryName, categorySlug, difficultyLevel }: ProductAttributesProps) {
  const router = useRouter();
  console.log("categoryName", categoryName)
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) {return "bg-green-100 text-green-800";}
    if (difficulty <= 3) {return "bg-yellow-100 text-yellow-800";}
    return "bg-red-100 text-red-800";
  };

  const handleCategoryClick = () => {
    if (categorySlug) {
      // Navigate to shop with category filter as URL parameter
      router.push(`/shop?categories=${categorySlug}`);
    }
  };

  return (
    <div className="space-y-2">
      {difficultyLevel && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Difficulty:</span>
          <Badge className={getDifficultyColor(difficultyLevel)} variant="secondary">
            {difficultyLevel}
          </Badge>
        </div>
      )}

      {categoryId && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Category:</span>
          <Badge
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            variant="outline"
          >
            {categoryName}
          </Badge>
        </div>
      )}
    </div>
  );
}
export default ProductAttributes