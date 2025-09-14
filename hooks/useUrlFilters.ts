import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useRef, startTransition } from 'react';

// Simple debounce implementation
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export interface FilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: string;
  isPlant?: boolean;
  care_difficulty_water?: number;
  care_difficulty_light?: number;
  care_difficulty_humidity?: number;
  care_difficulty_fertilizer?: number;
  care_difficulty_temperature?: number;
  max_care_difficulty?: number;
}

export const useUrlFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse current URL params into filter object
  const params: FilterParams = {};

  const search = searchParams.get('search');
  if (search) params.search = search;

  const category = searchParams.get('category');
  if (category) params.category = category;

  const minPrice = searchParams.get('minPrice');
  if (minPrice) params.minPrice = parseFloat(minPrice);

  const maxPrice = searchParams.get('maxPrice');
  if (maxPrice) params.maxPrice = parseFloat(maxPrice);

  const difficulty = searchParams.get('difficulty');
  if (difficulty) params.difficulty = difficulty;

  const isPlant = searchParams.get('isPlant');
  if (isPlant) params.isPlant = isPlant === 'true';

  // Care instruction difficulty filters
  const careWater = searchParams.get('care_difficulty_water');
  if (careWater) params.care_difficulty_water = parseInt(careWater);

  const careLight = searchParams.get('care_difficulty_light');
  if (careLight) params.care_difficulty_light = parseInt(careLight);

  const careHumidity = searchParams.get('care_difficulty_humidity');
  if (careHumidity) params.care_difficulty_humidity = parseInt(careHumidity);

  const careFertilizer = searchParams.get('care_difficulty_fertilizer');
  if (careFertilizer) params.care_difficulty_fertilizer = parseInt(careFertilizer);

  const careTemperature = searchParams.get('care_difficulty_temperature');
  if (careTemperature) params.care_difficulty_temperature = parseInt(careTemperature);

  const maxCareDifficulty = searchParams.get('max_care_difficulty');
  if (maxCareDifficulty) params.max_care_difficulty = parseInt(maxCareDifficulty);

  const filters = params;

  // Use useRef to maintain the same debounced function instance
  const debouncedUpdateUrlRef = useRef<((newParams: URLSearchParams) => void) | null>(null);
  
  if (!debouncedUpdateUrlRef.current) {
    debouncedUpdateUrlRef.current = debounce((newParams: URLSearchParams) => {
      const qs = newParams.toString();
      const url = qs ? `?${qs}` : window.location.pathname;
      // Use transition to avoid blocking input typing
      startTransition(() => {
        router.replace(url, { scroll: false });
      });
    }, 300);
  }

  // Update a single filter parameter
  const setParam = useCallback((key: keyof FilterParams, value: string | number | boolean | null) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (value === null || value === undefined || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }

    // Skip if nothing actually changed
    if (newParams.toString() === searchParams.toString()) return;

    debouncedUpdateUrlRef.current?.(newParams);
  }, [searchParams]);

  // Update multiple filter parameters at once
  const setParams = useCallback((newFilters: Partial<FilterParams>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value.toString());
      }
    });

    // Skip if nothing actually changed
    if (newParams.toString() === searchParams.toString()) return;

    debouncedUpdateUrlRef.current?.(newParams);
  }, [searchParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  return {
    filters,
    setParam,
    setParams,
    clearFilters,
    hasActiveFilters
  };
};