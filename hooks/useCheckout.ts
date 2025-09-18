import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, handleMutationError, invalidateQueries } from '@/lib/queryClient';
import { Cart } from './useCart';
import { apiClient } from '@/lib/api/client';



// Types
export interface CheckoutData {
  // Contact Information
  email: string;
  phone?: string;
  
  // Shipping Address
  shipping_address: {
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  
  // Billing Address (optional, defaults to shipping)
  billing_address?: {
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  
  // Payment Information (in a real app, this would be handled by a payment processor)
  payment_method: 'credit_card' | 'paypal' | 'stripe';
  
  // Order Notes
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  session_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  
  // Contact Information
  email: string;
  phone?: string;
  
  // Addresses
  shipping_address: CheckoutData['shipping_address'];
  billing_address: CheckoutData['billing_address'];
  
  // Order Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  
  // Payment
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_id?: string;
  
  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface CheckoutResponse {
  order: Order;
  payment_url?: string; // For external payment processors
  success: boolean;
  message: string;
}

export interface OrdersFilters extends Record<string, unknown> {
  status?: Order['status'];
  email?: string;
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}

// API functions
const processCheckout = async (checkoutData: CheckoutData): Promise<CheckoutResponse> => {
  const response = await apiClient('/api/orders', {
    method: 'POST',
    body: JSON.stringify(checkoutData),
    requiresAuth: true
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Checkout failed: ${response.statusText}`);
  }
  
  return response.json();
};

const fetchOrder = async (orderId: string): Promise<Order> => {
  const response = await apiClient(`/api/orders/${orderId}`, {
    method: 'GET',
    requiresAuth: true
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch order: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};

const fetchOrders = async (filters?: OrdersFilters): Promise<Order[]> => {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.email) params.append('email', filters.email);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const response = await fetch(`/api/orders?${params.toString()}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }
  
  return response.json();
};

const validateCheckoutData = (data: CheckoutData): string[] => {
  const errors: string[] = [];
  
  // Email validation
  if (!data.email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Shipping address validation
  const shipping = data.shipping_address;
  if (!shipping.first_name) errors.push('First name is required');
  if (!shipping.last_name) errors.push('Last name is required');
  if (!shipping.address_line_1) errors.push('Address is required');
  if (!shipping.city) errors.push('City is required');
  if (!shipping.state) errors.push('State is required');
  if (!shipping.postal_code) errors.push('Postal code is required');
  if (!shipping.country) errors.push('Country is required');
  
  // Payment method validation
  if (!data.payment_method) {
    errors.push('Payment method is required');
  }
  
  return errors;
};

// Custom hooks
export const useCheckoutMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: processCheckout,
    onSuccess: (data) => {
      // Clear cart after successful checkout
      invalidateQueries.cart();
      
      // Invalidate orders to include the new order
      invalidateQueries.orders();
      
      // Cache the new order
      queryClient.setQueryData(
        queryKeys.orders.detail(data.order.id),
        data.order
      );
    },
    onError: handleMutationError,
  });
};

export const useOrderQuery = (orderId: string) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
  });
};

export const useOrdersQuery = (filters?: OrdersFilters) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => fetchOrders(filters),
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
};

// Utility hooks
export const useCheckoutValidation = () => {
  return {
    validateCheckoutData,
    validateEmail: (email: string) => {
      if (!email) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
    validateRequired: (value: string, fieldName: string) => {
      if (!value || value.trim() === '') {
        return `${fieldName} is required`;
      }
      return null;
    },
    validatePostalCode: (postalCode: string, country: string = 'US') => {
      if (!postalCode) return 'Postal code is required';
      
      // Basic validation - can be extended for different countries
      if (country === 'US') {
        if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
          return 'Please enter a valid US postal code (12345 or 12345-6789)';
        }
      }
      
      return null;
    },
    validatePhone: (phone?: string) => {
      if (!phone) return null; // Phone is optional
      
      // Basic phone validation
      if (!/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/.test(phone.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number';
      }
      
      return null;
    },
  };
};

// Hook for managing checkout form state
export const useCheckoutForm = () => {
  const checkoutMutation = useCheckoutMutation();
  const { validateCheckoutData } = useCheckoutValidation();
  
  const submitCheckout = async (data: CheckoutData) => {
    // Validate data before submission
    const errors = validateCheckoutData(data);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return checkoutMutation.mutateAsync(data);
  };
  
  return {
    submitCheckout,
    isLoading: checkoutMutation.isPending,
    error: checkoutMutation.error,
    isSuccess: checkoutMutation.isSuccess,
    data: checkoutMutation.data,
    reset: checkoutMutation.reset,
  };
};

// Hook for order tracking
export const useOrderTracking = (orderNumber: string) => {
  return useQuery({
    queryKey: ['order-tracking', orderNumber],
    queryFn: async () => {
      const response = await fetch(`/api/orders/track/${orderNumber}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
    enabled: !!orderNumber,
    // Refetch every 30 seconds for real-time tracking
    refetchInterval: 30000,
  });
};