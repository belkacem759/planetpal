import { apiClient } from '@/lib/api/client';
import { handleMutationError, invalidateQueries, queryKeys } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/lib/db';

// Note: Auth headers are now handled by the apiClient

// Types
export interface CartItem {
  created_at: string;
  id: string;
  price: number; // Price at the time of adding to cart
  // Relations
  product: Product;
  product_id: string;
  quantity: number;
  updated_at: string;
}

export interface Cart {
  created_at: string;
  id: string;
  items: CartItem[];
  session_id?: string;
  shipping_amount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  total_items: number;
  updated_at: string;
  user_id?: string;
}

export interface AddToCartData {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemData {
  item_id: string;
  quantity: number;
}

// API functions
const fetchCart = async (): Promise<Cart> => {
  try {
    const response = await apiClient('/api/cart', {
      method: 'GET',
      requiresAuth: true
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty cart if none exists
        return {
          created_at: new Date().toISOString(),
          id: '',
          items: [],
          shipping_amount: 0,
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          total_items: 0,
          updated_at: new Date().toISOString(),
        };
      }
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }

    const result = await response.json();

    // Transform the API response to match the expected Cart interface
    const cartItems = (result.data || [])
    const subtotal = cartItems.reduce((sum: number, item: any) =>
      sum + (item.product?.price || 0) * item.quantity, 0
    );
    const tax_amount = subtotal * 0.08; // 8% tax
    const shipping_amount = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total_amount = subtotal + tax_amount + shipping_amount;

    return {
      created_at: cartItems.length > 0 ? cartItems[0].created_at : new Date().toISOString(),
      id: cartItems.id || 'temp-cart-id', // Use cart_id from response or temp ID
      items: cartItems,
      shipping_amount,
      subtotal,
      tax_amount,
      total_amount,
      total_items: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
      updated_at: cartItems.length > 0 ? cartItems[0].updated_at : new Date().toISOString(),
    };
  } catch (error) {
    // If not authenticated, return empty cart
    if (error instanceof Error && error.message.includes('No authentication token')) {
      return {
        created_at: new Date().toISOString(),
        id: '',
        items: [],
        shipping_amount: 0,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        total_items: 0,
        updated_at: new Date().toISOString(),
      };
    }
    throw error;
  }
};

const addToCart = async (data: AddToCartData): Promise<CartItem> => {
  const response = await apiClient('/api/cart', {
    body: JSON.stringify(data),
    method: 'POST',
    requiresAuth: true
  });

  if (!response.ok) {
    throw new Error(`Failed to add item to cart: ${response.statusText}`);
  }

  return response.json();
};

const updateCartItem = async (data: UpdateCartItemData): Promise<Cart> => {
  const response = await apiClient(`/api/cart/${data.item_id}`, {
    body: JSON.stringify({ quantity: data.quantity }),
    method: 'PUT',
    requiresAuth: true
  });

  if (!response.ok) {
    throw new Error(`Failed to update cart item: ${response.statusText}`);
  }

  const result = await response.json();

  // Transform the API response to match the expected Cart interface
  const cartItems = (result.data || []).map((item: any) => ({
    created_at: item.created_at,
    id: item.id,
    price: item.product?.price || 0,
    product: {
      id: item.product?.id || '',
      image_url: item.product?.images?.[0] || null,
      name: item.product?.name || '',
      price: item.product?.price || 0,
      slug: item.product?.slug || '',
      stock_quantity: item.product?.stock_quantity || 0,
    },
    product_id: item.product_id,
    quantity: item.quantity,
    updated_at: item.updated_at,
  }));

  const subtotal = cartItems.reduce((sum: number, item: any) =>
    sum + (item.product?.price || 0) * item.quantity, 0
  );
  const tax_amount = subtotal * 0.08;
  const shipping_amount = subtotal > 50 ? 0 : 9.99;
  const total_amount = subtotal + tax_amount + shipping_amount;

  return {
    created_at: new Date().toISOString(),
    id: result.cart_id || 'temp-cart-id',
    items: cartItems,
    shipping_amount,
    subtotal,
    tax_amount,
    total_amount,
    total_items: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
    updated_at: new Date().toISOString(),
  };
};

const removeFromCart = async (itemId: string): Promise<void> => {
  const response = await apiClient(`/api/cart/${itemId}`, {
    method: 'DELETE',
    requiresAuth: true
  });

  if (!response.ok) {
    throw new Error(`Failed to remove item from cart: ${response.statusText}`);
  }
};

const clearCart = async (): Promise<void> => {
  const response = await apiClient('/api/cart', {
    method: 'DELETE',
    requiresAuth: true
  });

  if (!response.ok) {
    throw new Error(`Failed to clear cart: ${response.statusText}`);
  }
};

// Custom hooks
export const useCartQuery = () => {
  return useQuery({
    queryFn: fetchCart,
    queryKey: queryKeys.cart.items(),
    // Always enable cart query
    enabled: true,
    // Refetch on window focus to sync cart state
    refetchOnWindowFocus: true,
    // Keep cart data fresh
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      invalidateQueries.cart();
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
    onError: handleMutationError,
    onSuccess: (updatedCart: Cart) => {
      // Update the cart data directly with the response
      queryClient.setQueryData(queryKeys.cart.items(), updatedCart);
    },
  });
};

export const useOptimisticUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
    onError: (err, variables, context: { previousCart?: Cart } | undefined) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
      }
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<Cart>(queryKeys.cart.items());

      // Optimistically update to the new value
      if (previousCart) {
        const optimisticCart = {
          ...previousCart,
          items: previousCart.items.map(item =>
            item.id === variables.item_id
              ? { ...item, quantity: variables.quantity }
              : item
          )
        };

        // Recalculate totals
        const subtotal = optimisticCart.items.reduce(
          (sum, item) => sum + (item.product?.price || 0) * item.quantity,
          0
        );
        const tax_amount = subtotal * 0.08;
        const shipping_amount = subtotal > 50 ? 0 : 9.99;
        const total_amount = subtotal + tax_amount + shipping_amount;

        optimisticCart.subtotal = subtotal;
        optimisticCart.tax_amount = tax_amount;
        optimisticCart.shipping_amount = shipping_amount;
        optimisticCart.total_amount = total_amount;
        optimisticCart.total_items = optimisticCart.items.reduce((sum, item) => sum + item.quantity, 0);

        queryClient.setQueryData(queryKeys.cart.items(), optimisticCart);
      }

      // Return a context object with the snapshotted value
      return { previousCart };
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
  });
};

export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromCart,
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      invalidateQueries.cart();
    },
  });
};

export const useClearCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      invalidateQueries.cart();
    },
  });
};

// Utility hooks
export const useCartItemCount = () => {
  const { data: cart } = useCartQuery();
  return cart?.total_items || 0;
};

export const useCartTotal = () => {
  const { data: cart } = useCartQuery();
  return {
    shipping: cart?.shipping_amount || 0,
    subtotal: cart?.subtotal || 0,
    tax: cart?.tax_amount || 0,
    total: cart?.total_amount || 0,
  };
};

export const useIsInCart = (productId: string) => {
  const { data: cart } = useCartQuery();
  return cart?.items.some(item => item.product_id === productId) || false;
};

export const useCartItemQuantity = (productId: string) => {
  const { data: cart } = useCartQuery();
  const item = cart?.items.find(item => item.product_id === productId);
  return item?.quantity || 0;
};

// Optimistic updates for better UX
export const useOptimisticAddToCart = () => {
  const queryClient = useQueryClient();
  const addToCartMutation = useAddToCartMutation();

  return useMutation({
    mutationFn: addToCart,
    onError: (err, newItem, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
      }
      handleMutationError(err, newItem, context);
    },
    onMutate: async (newItem: AddToCartData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<Cart>(queryKeys.cart.items());

      // Optimistically update to the new value
      if (previousCart) {
        const existingItemIndex = previousCart.items.findIndex(
          item => item.product_id === newItem.product_id
        );

        const updatedItems = [...previousCart.items];

        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          };
        } else {
          // Add new item (we don't have full product data, so this is simplified)
          const newCartItem: CartItem = {
            created_at: new Date().toISOString(),
            id: `temp-${Date.now()}`,
            price: 0, // Will be updated when real response comes
            product: {} as Product, // Will be populated by server response
            product_id: newItem.product_id,
            quantity: newItem.quantity,
            updated_at: new Date().toISOString(),
          };
          updatedItems.push(newCartItem);
        }

        const updatedCart: Cart = {
          ...previousCart,
          items: updatedItems,
          total_items: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        };

        queryClient.setQueryData(queryKeys.cart.items(), updatedCart);
      }

      // Return a context object with the snapshotted value
      return { previousCart };
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have correct data
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
  });
};