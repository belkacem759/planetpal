import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that unused/inactive cache data remains in memory
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Time in milliseconds that the cache survives unused/inactive
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Retry failed requests
      retry: (failureCount: number, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error && 
            typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Retry delay
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: (failureCount: number, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error && 
            typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      // Retry delay for mutations
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Query Keys Factory
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.products.details(), slug] as const,
  },
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.categories.lists(), filters] as const,
  },
  // Cart
  cart: {
    all: ['cart'] as const,
    items: () => [...queryKeys.cart.all, 'items'] as const,
  },
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
} as const;

// Error handling utility
export const handleQueryError = (error: unknown) => {
  console.error('Query error:', error);
  
  // You can add global error handling here
  // For example, show toast notifications, redirect to login, etc.
  
  return error;
};

// Success handling utility
export const handleMutationSuccess = (data: unknown, variables: unknown, context: unknown) => {
  console.log('Mutation success:', { data, variables, context });
  
  // You can add global success handling here
  // For example, show success toast notifications
  
  return data;
};

// Mutation error handling utility
export const handleMutationError = (error: unknown, variables: unknown, context: unknown) => {
  console.error('Mutation error:', { error, variables, context });
  
  // You can add global mutation error handling here
  // For example, show error toast notifications
  
  return error;
};

// Utility to invalidate related queries after mutations
export const invalidateQueries = {
  products: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  },
  categories: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  },
  cart: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
  },
  user: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  },
  orders: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  },
  all: () => {
    queryClient.invalidateQueries();
  },
};

// Prefetch utilities
export const prefetchQueries = {
  products: async (filters?: Record<string, unknown>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(filters),
      queryFn: () => {
        // This will be implemented in the hooks
        throw new Error('Products query function not implemented');
      },
    });
  },
  categories: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: () => {
        // This will be implemented in the hooks
        throw new Error('Categories query function not implemented');
      },
    });
  },
};

export default queryClient;