import { createClient } from '@/lib/supabase/server';
import { createError } from '@/lib/errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

/**
 * Get authenticated user from Supabase session
 * This utility can be reused across API routes that need user authentication
 */
export async function getAuthenticatedUser(): Promise<{
  user: AuthenticatedUser | null;
  error: any | null;
}> {
  try {
    const supabase = await createClient();

    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: createError.unauthorized('Authentication required')
      };
    }

    // Get user profile with role from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, use basic user info
      return {
        user: {
          id: user.id,
          email: user.email || '',
          role: 'user'
        },
        error: null
      };
    }

    return {
      user: {
        id: profile.id,
        email: profile.email || user.email || '',
        role: profile.role || 'user'
      },
      error: null
    };
  } catch (error) {
    return {
      user: null,
      error: createError.internal('Authentication failed', error)
    };
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: AuthenticatedUser | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user owns a resource or is admin
 */
export function canAccessResource(user: AuthenticatedUser | null, resourceUserId: string): boolean {
  if (!user) return false;
  return user.id === resourceUserId || isAdmin(user);
}