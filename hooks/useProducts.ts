import { apiClient } from '@/lib/api/client';
import { ApiSuccessResponse } from '@/lib/errors';
import { handleMutationError, invalidateQueries, queryKeys } from '@/lib/queryClient';
import { Product } from '@/types/types';
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

// Types

export interface ProductsFilters extends Record<string, unknown> {
  care_difficulty_fertilizer?: number;
  care_difficulty_humidity?: number;
  care_difficulty_light?: number;
  care_difficulty_temperature?: number;
  care_difficulty_water?: number;
  categories?: string[];
  difficulty?: string;
  inStock?: boolean;
  isPlant?: boolean;
  limit?: number;
  max_care_difficulty?: number;
  maxPrice?: number;
  minPrice?: number;
  offset?: number;
  search?: string;
}

export interface ProductsQueryResult extends ApiSuccessResponse<Product[]> {
  products: Product[];
}

// API functions (these will call your actual API endpoints)
const fetchProducts = async (filters?: ProductsFilters): Promise<ApiSuccessResponse<Product[]>> => {
  const params = new URLSearchParams();

  if (filters?.categories && filters.categories.length > 0) {
    filters.categories.forEach(category => params.append('categories', category));
  }
  if (filters?.search) {params.append('search', filters.search);}
  if (filters?.minPrice) {params.append('minPrice', filters.minPrice.toString());}
  if (filters?.maxPrice) {params.append('maxPrice', filters.maxPrice.toString());}
  if (filters?.difficulty) {params.append('difficulty', filters.difficulty);}
  if (filters?.isPlant !== undefined) {params.append('isPlant', filters.isPlant.toString());}
  if (filters?.inStock !== undefined) {params.append('inStock', filters.inStock.toString());}
  if (filters?.limit) {params.append('limit', filters.limit.toString());}
  if (filters?.offset) {params.append('offset', filters.offset.toString());}

  const response = await apiClient(`/api/products?${params.toString()}`, {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
};

const fetchProduct = async (slug: string): Promise<Product> => {
  const response = await fetch(`/api/products/${slug}`, {
    cache: 'force-cache',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  const result: ApiSuccessResponse<Product> = await response.json();
  return result.data;
};

// Custom hooks
export const useProductsQuery = (filters?: ProductsFilters): UseQueryResult<ProductsQueryResult, Error> => {
  return useQuery({
    queryFn: () => fetchProducts(filters),
    queryKey: queryKeys.products.list(filters),
    // Enable the query by default
    enabled: true,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Transform the ApiSuccessResponse to extract data while preserving metadata
    select: (data: ApiSuccessResponse<Product[]>): ProductsQueryResult => ({
      ...data,
      products: data.data,
    }),
  });
};

export const useProductQuery = (slug: string) => {
  return useQuery({
    queryFn: () => fetchProduct(slug),
    queryKey: queryKeys.products.detail(slug),
    // Only enable if slug is provided
    enabled: !!slug,
  });
};

// Product management mutations (for admin use)
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/products', {
        body: JSON.stringify(productData),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.statusText}`);
      }

      return response.json();
    },
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate and refetch products
      invalidateQueries.products();
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
      const response = await fetch(`/api/products/${id}`, {
        body: JSON.stringify(productData),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.statusText}`);
      }

      return response.json();
    },
    onError: handleMutationError,
    onSuccess: (data, variables) => {
      // Invalidate specific product and products list
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(data.slug) });
      invalidateQueries.products();
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.statusText}`);
      }

      return response.json();
    },
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate products list
      invalidateQueries.products();
    },
  });
};

// Utility hooks
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryFn: () => fetchProduct(slug),
      queryKey: queryKeys.products.detail(slug),
      // Cache for 5 minutes
      staleTime: 1000 * 60 * 5,
    });
  };
};

export const usePrefetchProducts = () => {
  const queryClient = useQueryClient();

  return (filters?: ProductsFilters) => {
    queryClient.prefetchQuery({
      queryFn: () => fetchProducts(filters),
      queryKey: queryKeys.products.list(filters),
      // Cache for 5 minutes
      staleTime: 1000 * 60 * 5,
    });
  };
};