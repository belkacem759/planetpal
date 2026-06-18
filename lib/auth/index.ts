import { createClient } from '@/lib/supabase/server';
import { createError } from '@/lib/errors';

export interface AuthenticatedUser {
  email: string;
  id: string;
  role?: string;
}

/**
 * Get authenticated user from Supabase session
 * This utility can be reused across API routes that need user authentication
 */
export async function getAuthenticatedUser(): Promise<{
  error: any | null;
  user: AuthenticatedUser | null;
}> {
  try {
    const supabase = await createClient();

    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        error: createError.unauthorized('Authentication required'),
        user: null
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
        error: null,
        user: {
          email: user.email || '',
          id: user.id,
          role: 'user'
        }
      };
    }

    return {
      error: null,
      user: {
        email: profile.email || user.email || '',
        id: profile.id,
        role: profile.role || 'user'
      }
    };
  } catch (error) {
    return {
      error: createError.internal('Authentication failed', error),
      user: null
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
  if (!user) {return false;}
  return user.id === resourceUserId || isAdmin(user);
}