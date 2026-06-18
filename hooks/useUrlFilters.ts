import { useQueryStates, parseAsString, parseAsInteger, parseAsBoolean, parseAsArrayOf, parseAsStringEnum } from 'nuqs';

// Define parsers for each filter type
const filterParsers = {
  // Search query
  search: parseAsString.withDefault(''),
  
  // Multiple categories using slugs
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  
  // Price range
  maxPrice: parseAsInteger.withDefault(1000),
  minPrice: parseAsInteger.withDefault(0),
  
  // Difficulty level
  difficulty: parseAsStringEnum(['beginner', 'intermediate', 'advanced']),
  
  // Plants only filter
  isPlant: parseAsBoolean.withDefault(false),
  
  // Care instruction difficulty filters
  care_difficulty_fertilizer: parseAsInteger,
  care_difficulty_humidity: parseAsInteger,
  care_difficulty_light: parseAsInteger,
  care_difficulty_soil: parseAsInteger,
  care_difficulty_sunlight: parseAsInteger,
  care_difficulty_temperature: parseAsInteger,
  care_difficulty_water: parseAsInteger,
  care_difficulty_watering: parseAsInteger,
  
  // Maximum care difficulty
  max_care_difficulty: parseAsInteger,
};

export type FilterParams = {
  care_difficulty_fertilizer?: number;
  care_difficulty_humidity?: number;
  care_difficulty_light?: number;
  care_difficulty_soil?: number;
  care_difficulty_sunlight?: number;
  care_difficulty_temperature?: number;
  care_difficulty_water?: number;
  care_difficulty_watering?: number;
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  isPlant: boolean;
  max_care_difficulty?: number;
  maxPrice: number;
  minPrice: number;
  search: string;
};

export const useUrlFilters = () => {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    // Debounce URL updates to avoid excessive navigation
    throttleMs: 300,
    // Use shallow routing for better performance
    shallow: true,
    // Clear empty values from URL
    clearOnDefault: true,
  });

  // Helper function to update a single filter parameter
  const setParam = <K extends keyof FilterParams>(
    key: K,
    value: FilterParams[K] | null
  ) => {
    setFilters({ [key]: value });
  };

  // Helper function to update multiple filter parameters at once
  const setParams = (newFilters: Partial<FilterParams>) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      care_difficulty_fertilizer: null,
      care_difficulty_humidity: null,
      care_difficulty_light: null,
      care_difficulty_soil: null,
      care_difficulty_sunlight: null,
      care_difficulty_temperature: null,
      care_difficulty_water: null,
      care_difficulty_watering: null,
      categories: [],
      difficulty: null,
      isPlant: false,
      max_care_difficulty: null,
      maxPrice: 1000,
      minPrice: 0,
      search: '',
    });
  };

  // Check if any filters are active (excluding defaults)
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.categories.length > 0 ||
    filters.minPrice !== 0 ||
    filters.maxPrice !== 1000 ||
    filters.difficulty !== null ||
    filters.isPlant !== false ||
    filters.care_difficulty_watering !== null ||
    filters.care_difficulty_sunlight !== null ||
    filters.care_difficulty_soil !== null ||
    filters.care_difficulty_water !== null ||
    filters.care_difficulty_light !== null ||
    filters.care_difficulty_humidity !== null ||
    filters.care_difficulty_fertilizer !== null ||
    filters.care_difficulty_temperature !== null ||
    filters.max_care_difficulty !== null;

  return {
    clearFilters,
    filters,
    hasActiveFilters,
    setParam,
    setParams,
  };
};