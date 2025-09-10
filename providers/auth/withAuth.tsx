'use client';

import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/service';

type WithAuthProps = {
  children: ReactNode;
  requiredRole?: string;
};

/**
 * A client component that manages auth state and renders content based on authentication status.
 * Middleware handles redirects, this component focuses on UI state management only.
 * 
 * @param children - The content to render if the user is authenticated
 * @param requiredRole - Optional role that the user must have to access the content
 */
export function WithAuth({ children, requiredRole }: WithAuthProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('WithAuth: Auth check:', { data, error });
        
        if (!isMounted) return;
        
        if (error || !data?.session) {
          setIsAuthenticated(false);
          setHasRequiredRole(false);
          setIsChecking(false);
          return;
        }

        setIsAuthenticated(true);

        // If a specific role is required, check if the user has it
        if (requiredRole) {
          const userRole = data.session.user.user_metadata.role;
          const roleMatches = userRole === requiredRole;
          setHasRequiredRole(roleMatches);
        } else {
          setHasRequiredRole(true);
        }

        setIsChecking(false);
      } catch (error) {
        console.error('WithAuth: Auth check failed:', error);
        if (!isMounted) return;
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        setIsChecking(false);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('WithAuth: Auth state changed:', event, !!session);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        setIsChecking(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-check auth when signed in or token refreshed to handle role requirements
        await checkAuth();
      }
    });

    // Initial auth check
    checkAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show unauthorized message if user doesn't have required role
  if (isAuthenticated && requiredRole && !hasRequiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated and has required role
  return isAuthenticated && hasRequiredRole ? <>{children}</> : null;
}