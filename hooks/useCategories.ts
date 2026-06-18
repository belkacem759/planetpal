import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, handleMutationError, invalidateQueries } from '@/lib/queryClient';
import { ApiSuccessResponse } from '@/lib/errors';

// Types
export interface Category {
  children?: Category[];
  created_at: string;
  description?: string;
  id: string;
  image_url?: string;
  name: string;
  // Relations
  parent?: Category;
  parent_id?: string;
  products_count?: number;
  slug: string;
  updated_at: string;
}

export interface CategoriesFilters extends Record<string, unknown> {
  include_children?: boolean;
  include_products_count?: boolean;
  limit?: number;
  offset?: number;
  parent_id?: string;
}

// API functions
const fetchCategories = async (filters?: CategoriesFilters): Promise<ApiSuccessResponse<Category[]>> => {
  const params = new URLSearchParams();

  if (filters?.parent_id) {params.append('parent_id', filters.parent_id);}
  if (filters?.include_children !== undefined) {params.append('include_children', filters.include_children.toString());}
  if (filters?.include_products_count !== undefined) {params.append('include_products_count', filters.include_products_count.toString());}
  if (filters?.limit) {params.append('limit', filters.limit.toString());}
  if (filters?.offset) {params.append('offset', filters.offset.toString());}

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
    queryFn: () => fetchCategories(filters),
    queryKey: queryKeys.categories.list(filters),
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
    queryFn: () => fetchCategory(slug),
    queryKey: [...queryKeys.categories.all, 'detail', slug],
    // Only enable if slug is provided
    enabled: !!slug,
  });
};

// Get root categories (no parent)
export const useRootCategoriesQuery = () => {
  return useCategoriesQuery({ include_products_count: true, parent_id: undefined });
};

// Get child categories of a parent
export const useChildCategoriesQuery = (parentId: string) => {
  return useCategoriesQuery({
    include_products_count: true,
    parent_id: parentId,
  });
};

// Category management mutations (for admin use)
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/categories', {
        body: JSON.stringify(categoryData),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to create category: ${response.statusText}`);
      }

      return response.json();
    },
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate and refetch categories
      invalidateQueries.categories();
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<Category> & { id: string }) => {
      const response = await fetch(`/api/categories/${id}`, {
        body: JSON.stringify(categoryData),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to update category: ${response.statusText}`);
      }

      return response.json();
    },
    onError: handleMutationError,
    onSuccess: (data) => {
      // Invalidate specific category and categories list
      queryClient.invalidateQueries({ queryKey: [...queryKeys.categories.all, 'detail', data.slug] });
      invalidateQueries.categories();
    },
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
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate categories list
      invalidateQueries.categories();
    },
  });
};

// Utility hooks
export const usePrefetchCategory = () => {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryFn: () => fetchCategory(slug),
      queryKey: [...queryKeys.categories.all, 'detail', slug],
      // Cache for 5 minutes
      staleTime: 1000 * 60 * 5,
    });
  };
};

export const usePrefetchCategories = () => {
  const queryClient = useQueryClient();

  return (filters?: CategoriesFilters) => {
    queryClient.prefetchQuery({
      queryFn: () => fetchCategories(filters),
      queryKey: queryKeys.categories.list(filters),
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
    breadcrumbs: breadcrumbs || [],
    hierarchy,
    isLoading: !categoriesData,
  };
};