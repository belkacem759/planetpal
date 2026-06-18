import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, handleMutationError, invalidateQueries } from '@/lib/queryClient';
import { createClient } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api/client';



// Helper function to get auth headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
};

// Types
export interface User {
  // Addresses
  addresses?: Address[];
  avatar_url?: string;
  created_at: string;
  email: string;
  email_verified: boolean;
  first_name?: string;
  id: string;
  last_name?: string;
  phone?: string;
  
  // Preferences
  preferences?: {
    marketing_emails: boolean;
    newsletter_subscribed: boolean;
    order_notifications: boolean;
  };
  
  updated_at: string;
}

export interface Address {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  company?: string;
  country: string;
  created_at: string;
  first_name: string;
  id: string;
  is_default: boolean;
  last_name: string;
  phone?: string;
  postal_code: string;
  state: string;
  type: 'shipping' | 'billing';
  updated_at: string;
  user_id: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  phone?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferences?: User['preferences'];
}

export interface ChangePasswordData {
  confirm_password: string;
  current_password: string;
  new_password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: User;
}

// API functions
const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: authHeaders,
    });
    
    if (response.status === 401) {
      // User is not authenticated
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    // If no auth token available, user is not authenticated
    if (error instanceof Error && error.message.includes('No authentication token')) {
      return null;
    }
    throw error;
  }
};

const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/login', {
    body: JSON.stringify(data),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }
  
  return response.json();
};

const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/register', {
    body: JSON.stringify(data),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }
  
  return response.json();
};

const logout = async (): Promise<void> => {
  const response = await fetch('/api/auth/logout', {
    credentials: 'include',
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
};

const updateUser = async (data: UpdateUserData): Promise<User> => {
  const response = await apiClient('/api/auth/profile', {
    body: JSON.stringify(data),
    method: 'PUT',
    requiresAuth: true
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update profile');
  }
  
  return response.json();
};

const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  const response = await apiClient('/api/auth/change-password', {
    body: JSON.stringify(data),
    method: 'POST',
    requiresAuth: true
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to change password');
  }
  
  return response.json();
};

const fetchUserAddresses = async (): Promise<Address[]> => {
  const authHeaders = await getAuthHeaders();
  const response = await fetch('/api/auth/addresses', {
    credentials: 'include',
    headers: authHeaders,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch addresses: ${response.statusText}`);
  }
  
  return response.json();
};

const createAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> => {
  const response = await apiClient('/api/auth/addresses', {
    body: JSON.stringify(address),
    method: 'POST',
    requiresAuth: true
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create address');
  }
  
  return response.json();
};

const updateAddress = async ({ id, ...address }: Partial<Address> & { id: string }): Promise<Address> => {
  const response = await apiClient(`/api/auth/addresses/${id}`, {
    body: JSON.stringify(address),
    method: 'PUT',
    requiresAuth: true
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update address');
  }
  
  return response.json();
};

const deleteAddress = async (id: string): Promise<void> => {
  const response = await apiClient(`/api/auth/addresses/${id}`, {
    method: 'DELETE',
    requiresAuth: true
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete address');
  }
};

// Custom hooks
export const useUserQuery = () => {
  return useQuery({
    queryFn: fetchCurrentUser,
    queryKey: queryKeys.user.profile(),
    // Always enable to check auth status
    enabled: true,
    // Don't retry on 401 (unauthorized)
    retry: (failureCount, error: any) => {
      if (error?.status === 401) {return false;}
      return failureCount < 3;
    },
    // Refetch on window focus to sync auth state
    refetchOnWindowFocus: true,
    // Keep user data fresh
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: login,
    onError: handleMutationError,
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), data.user);
      
      // Invalidate cart to sync with authenticated user
      invalidateQueries.cart();
    },
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: register,
    onError: handleMutationError,
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), data.user);
      
      // Invalidate cart to sync with authenticated user
      invalidateQueries.cart();
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logout,
    onError: handleMutationError,
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(queryKeys.user.profile(), null);
      
      // Clear all cached data
      queryClient.clear();
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onError: handleMutationError,
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), data);
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: changePassword,
    onError: handleMutationError,
  });
};

// Address management hooks
export const useUserAddressesQuery = () => {
  const { data: user } = useUserQuery();
  
  return useQuery({
    queryFn: fetchUserAddresses,
    queryKey: [...queryKeys.user.all, 'addresses'],
    // Only fetch if user is authenticated
    enabled: !!user,
  });
};

export const useCreateAddressMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAddress,
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate addresses to refetch
      queryClient.invalidateQueries({ queryKey: [...queryKeys.user.all, 'addresses'] });
    },
  });
};

export const useUpdateAddressMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAddress,
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate addresses to refetch
      queryClient.invalidateQueries({ queryKey: [...queryKeys.user.all, 'addresses'] });
    },
  });
};

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAddress,
    onError: handleMutationError,
    onSuccess: () => {
      // Invalidate addresses to refetch
      queryClient.invalidateQueries({ queryKey: [...queryKeys.user.all, 'addresses'] });
    },
  });
};

// Utility hooks
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useUserQuery();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  
  return {
    isAuthenticated,
    isLoading,
    requireAuth: () => {
      if (!isLoading && !isAuthenticated) {
        // In a real app, you might redirect to login page here
        throw new Error('Authentication required');
      }
    },
  };
};

// Validation utilities
export const useAuthValidation = () => {
  return {
    validateEmail: (email: string) => {
      if (!email) {return 'Email is required';}
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
    validatePassword: (password: string) => {
      if (!password) {return 'Password is required';}
      if (password.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return null;
    },
    validatePasswordConfirmation: (password: string, confirmation: string) => {
      if (!confirmation) {return 'Please confirm your password';}
      if (password !== confirmation) {
        return 'Passwords do not match';
      }
      return null;
    },
    validateRequired: (value: string, fieldName: string) => {
      if (!value || value.trim() === '') {
        return `${fieldName} is required`;
      }
      return null;
    },
  };
};