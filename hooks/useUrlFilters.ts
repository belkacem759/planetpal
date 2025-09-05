import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

// Simple debounce implementation
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
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
}

export const useUrlFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse current URL params into filter object
  const filters = useMemo((): FilterParams => {
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

    return params;
  }, [searchParams]);

  // Debounced function to update URL params
  const debouncedUpdateUrl = useMemo(
    () => debounce((newParams: URLSearchParams) => {
      const url = newParams.toString() ? `?${newParams.toString()}` : window.location.pathname;
      router.replace(url, { scroll: false });
    }, 300),
    [router]
  );

  // Update a single filter parameter
  const setParam = useCallback((key: keyof FilterParams, value: string | number | boolean | null) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (value === null || value === undefined || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }

    debouncedUpdateUrl(newParams);
  }, [searchParams, debouncedUpdateUrl]);

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

    debouncedUpdateUrl(newParams);
  }, [searchParams, debouncedUpdateUrl]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  return {
    filters,
    setParam,
    setParams,
    clearFilters,
    hasActiveFilters
  };
};