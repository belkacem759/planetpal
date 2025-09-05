
import { createClient } from '@/lib/supabase/client';

// Types for our API client
interface ApiOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth?: boolean;
}

// Helper to get auth headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token found');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`
  };
}



// Main API client function
export async function apiClient(
  url: string,
  options: ApiOptions = {}
): Promise<Response> {
  const {
    requiresAuth = false,
    headers = {},
    method = 'GET',
    ...restOptions
  } = options;

  // Prepare headers
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>)
  };

  // Add auth headers if needed
  if (requiresAuth) {
    try {
      const authHeaders = await getAuthHeaders();
      Object.assign(finalHeaders, authHeaders);
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Make the request
  return fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    ...restOptions
  });
}

// Convenience methods for common operations
export const api = {
  get: (url: string, options?: Omit<ApiOptions, 'method'>) => 
    apiClient(url, { ...options, method: 'GET' }),
    
  post: (url: string, data?: any, options?: Omit<ApiOptions, 'method'>) => 
    apiClient(url, { 
      ...options, 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),
    
  put: (url: string, data?: any, options?: Omit<ApiOptions, 'method'>) => 
    apiClient(url, { 
      ...options, 
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),
    
  delete: (url: string, options?: Omit<ApiOptions, 'method'>) => 
    apiClient(url, { ...options, method: 'DELETE' })
};