import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, handleQueryError, handleMutationError, invalidateQueries } from '@/lib/queryClient';
import { ApiSuccessResponse } from '@/lib/errors';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  parent?: Category;
  children?: Category[];
  products_count?: number;
}

export interface CategoriesFilters extends Record<string, unknown> {
  parent_id?: string;
  include_children?: boolean;
  include_products_count?: boolean;
  limit?: number;
  offset?: number;
}

// API functions
const fetchCategories = async (filters?: CategoriesFilters): Promise<ApiSuccessResponse<Category[]>> => {
  const params = new URLSearchParams();

  if (filters?.parent_id) params.append('parent_id', filters.parent_id);
  if (filters?.include_children !== undefined) params.append('include_children', filters.include_children.toString());
  if (filters?.include_products_count !== undefined) params.append('include_products_count', filters.include_products_count.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`/api/categories?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  const apiResponse: ApiSuccessResponse<Category[]> = await response.json();
  return apiResponse;
};

const fetchCategory = async (slug: string): Promise<Category> => {
  const response = await fetch(`/api/categories/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Category not found');
    }
    throw new Error(`Failed to fetch category: ${response.statusText}`);
  }

  return response.json();
};

// Custom hooks
export const useCategoriesQuery = (filters?: CategoriesFilters) => {
  return useQuery({
    queryKey: queryKeys.categories.list(filters),
    queryFn: () => fetchCategories(filters),
    // Enable the query by default
    enabled: true,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Transform the response to extract categories directly
    select: (data) => data.data, // Extract categories from ApiSuccessResponse.data
  });
};

export const useCategoryQuery = (slug: string) => {
  return useQuery({
    queryKey: [...queryKeys.categories.all, 'detail', slug],
    queryFn: () => fetchCategory(slug),
    // Only enable if slug is provided
    enabled: !!slug,
  });
};

// Get root categories (no parent)
export const useRootCategoriesQuery = () => {
  return useCategoriesQuery({ parent_id: undefined, include_products_count: true });
};

// Get child categories of a parent
export const useChildCategoriesQuery = (parentId: string) => {
  return useCategoriesQuery({
    parent_id: parentId,
    include_products_count: true,
  });
};

// Category management mutations (for admin use)
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create category: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      invalidateQueries.categories();
    },
    onError: handleMutationError,
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<Category> & { id: string }) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update category: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate specific category and categories list
      queryClient.invalidateQueries({ queryKey: [...queryKeys.categories.all, 'detail', data.slug] });
      invalidateQueries.categories();
    },
    onError: handleMutationError,
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete category: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate categories list
      invalidateQueries.categories();
    },
    onError: handleMutationError,
  });
};

// Utility hooks
export const usePrefetchCategory = () => {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.categories.all, 'detail', slug],
      queryFn: () => fetchCategory(slug),
      // Cache for 5 minutes
      staleTime: 1000 * 60 * 5,
    });
  };
};

export const usePrefetchCategories = () => {
  const queryClient = useQueryClient();

  return (filters?: CategoriesFilters) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(filters),
      queryFn: () => fetchCategories(filters),
      // Cache for 5 minutes
      staleTime: 1000 * 60 * 5,
    });
  };
};

// Helper function to get category hierarchy
export const useCategoryHierarchy = (categorySlug?: string) => {
  const { data: categoriesData } = useCategoriesQuery({ include_children: true });

  const buildHierarchy = (cats: Category[], parentId?: string): Category[] => {
    return cats
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        children: buildHierarchy(cats, cat.id),
      }));
  };

  const hierarchy = categoriesData ? buildHierarchy(categoriesData) : [];

  const findCategoryPath = (cats: Category[], targetSlug: string, path: Category[] = []): Category[] | null => {
    for (const cat of cats) {
      const currentPath = [...path, cat];
      if (cat.slug === targetSlug) {
        return currentPath;
      }
      if (cat.children) {
        const childPath = findCategoryPath(cat.children, targetSlug, currentPath);
        if (childPath) {
          return childPath;
        }
      }
    }
    return null;
  };

  const breadcrumbs = categorySlug ? findCategoryPath(hierarchy, categorySlug) : [];

  return {
    hierarchy,
    breadcrumbs: breadcrumbs || [],
    isLoading: !categoriesData,
  };
};