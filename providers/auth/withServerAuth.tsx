import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';

type WithServerAuthProps = {
  children: ReactNode;
  requiredRole?: string;
};

/**
 * A server component that handles role-based access control.
 * Middleware handles basic authentication redirects, this component focuses on role validation.
 * 
 * @param children - The content to render if the user has the required role
 * @param requiredRole - Optional role that the user must have to access the content
 */
export async function WithServerAuth({ children, requiredRole }: WithServerAuthProps) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // If no user (middleware should have handled this, but double-check)
  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // If a specific role is required, check if the user has it
  if (requiredRole) {
    let userRole: string | undefined = user.user_metadata?.role as string | undefined;

    // Fallback to database if role not in metadata
    if (!userRole) {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        userRole = (profile as { role?: string } | null)?.role;
      } catch (dbError) {
        console.error('WithServerAuth: Failed to fetch user role from database:', dbError);
      }
    }

    if (!userRole || userRole !== requiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">Required role: {requiredRole}</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}