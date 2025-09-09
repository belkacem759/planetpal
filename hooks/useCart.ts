import { apiClient } from '@/lib/api/client';
import { handleMutationError, invalidateQueries, queryKeys } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/lib/db';

// Note: Auth headers are now handled by the apiClient

// Types
export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number; // Price at the time of adding to cart
  created_at: string;
  updated_at: string;
  // Relations
  product: Product;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
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
          id: '',
          items: [],
          total_items: 0,
          subtotal: 0,
          tax_amount: 0,
          shipping_amount: 0,
          total_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }

    const result = await response.json();

    // Transform the API response to match the expected Cart interface
    const cartItems = (result.data || []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 0, // Use product price as cart item price
      created_at: item.created_at,
      updated_at: item.updated_at,
      product: {
        id: item.product?.id || '',
        name: item.product?.name || '',
        slug: item.product?.slug || '',
        price: item.product?.price || 0,
        image_url: item.product?.images?.[0] || null,
        stock_quantity: item.product?.stock_quantity || 0,
      },
    }));
    const subtotal = cartItems.reduce((sum: number, item: any) =>
      sum + (item.product?.price || 0) * item.quantity, 0
    );
    const tax_amount = subtotal * 0.08; // 8% tax
    const shipping_amount = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total_amount = subtotal + tax_amount + shipping_amount;

    return {
      id: result.cart_id || 'temp-cart-id', // Use cart_id from response or temp ID
      items: cartItems,
      total_items: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
      subtotal,
      tax_amount,
      shipping_amount,
      total_amount,
      created_at: cartItems.length > 0 ? cartItems[0].created_at : new Date().toISOString(),
      updated_at: cartItems.length > 0 ? cartItems[0].updated_at : new Date().toISOString(),
    };
  } catch (error) {
    // If not authenticated, return empty cart
    if (error instanceof Error && error.message.includes('No authentication token')) {
      return {
        id: '',
        items: [],
        total_items: 0,
        subtotal: 0,
        tax_amount: 0,
        shipping_amount: 0,
        total_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw error;
  }
};

const addToCart = async (data: AddToCartData): Promise<CartItem> => {
  const response = await apiClient('/api/cart', {
    method: 'POST',
    body: JSON.stringify(data),
    requiresAuth: true
  });

  if (!response.ok) {
    throw new Error(`Failed to add item to cart: ${response.statusText}`);
  }

  return response.json();
};

const updateCartItem = async (data: UpdateCartItemData): Promise<Cart> => {
  const response = await apiClient(`/api/cart/${data.item_id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity: data.quantity }),
    requiresAuth: true
  });

  if (!response.ok) {
    throw new Error(`Failed to update cart item: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Transform the API response to match the expected Cart interface
  const cartItems = (result.data || []).map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.product?.price || 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product: {
      id: item.product?.id || '',
      name: item.product?.name || '',
      slug: item.product?.slug || '',
      price: item.product?.price || 0,
      image_url: item.product?.images?.[0] || null,
      stock_quantity: item.product?.stock_quantity || 0,
    },
  }));
  
  const subtotal = cartItems.reduce((sum: number, item: any) =>
    sum + (item.product?.price || 0) * item.quantity, 0
  );
  const tax_amount = subtotal * 0.08;
  const shipping_amount = subtotal > 50 ? 0 : 9.99;
  const total_amount = subtotal + tax_amount + shipping_amount;

  return {
    id: result.cart_id || 'temp-cart-id',
    items: cartItems,
    total_items: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
    subtotal,
    tax_amount,
    shipping_amount,
    total_amount,
    created_at: new Date().toISOString(),
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
    queryKey: queryKeys.cart.items(),
    queryFn: fetchCart,
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
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      invalidateQueries.cart();
    },
    onError: handleMutationError,
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCartItem,
    onSuccess: (updatedCart: Cart) => {
      // Update the cart data directly with the response
      queryClient.setQueryData(queryKeys.cart.items(), updatedCart);
    },
    onError: handleMutationError,
  });
};

export const useOptimisticUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
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
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
      }
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
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      invalidateQueries.cart();
    },
    onError: handleMutationError,
  });
};

export const useClearCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      invalidateQueries.cart();
    },
    onError: handleMutationError,
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
    subtotal: cart?.subtotal || 0,
    tax: cart?.tax_amount || 0,
    shipping: cart?.shipping_amount || 0,
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

        let updatedItems = [...previousCart.items];

        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          };
        } else {
          // Add new item (we don't have full product data, so this is simplified)
          const newCartItem: CartItem = {
            id: `temp-${Date.now()}`,
            product_id: newItem.product_id,
            quantity: newItem.quantity,
            price: 0, // Will be updated when real response comes
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product: {} as Product, // Will be populated by server response
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
    onError: (err, newItem, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
      }
      handleMutationError(err, newItem, context);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have correct data
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
  });
};