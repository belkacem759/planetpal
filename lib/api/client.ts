
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
    headers = {},
    method = 'GET',
    requiresAuth = false,
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
    credentials: 'include',
    headers: finalHeaders,
    method,
    ...restOptions
  });
}

// Convenience methods for common operations
export const api = {
  delete: (url: string, options?: Omit<ApiOptions, 'method'>) => 
    apiClient(url, { ...options, method: 'DELETE' }),
    
  get: (url: string, options?: Omit<ApiOptions, 'method'>) => 
    apiClient(url, { ...options, method: 'GET' }),
    
  post: (url: string, data?: any, options?: Omit<ApiOptions, 'method'>) => 
    apiClient(url, { 
      ...options, 
      body: data ? JSON.stringify(data) : undefined,
      method: 'POST'
    }),
    
  put: (url: string, data?: any, options?: Omit<ApiOptions, 'method'>) => 
    apiClient(url, { 
      ...options, 
      body: data ? JSON.stringify(data) : undefined,
      method: 'PUT'
    })
};