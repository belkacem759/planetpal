'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/service';

type WithAuthProps = {
  children: ReactNode;
  requiredRole?: string;
};

/**
 * A client component that protects routes by checking if the user is authenticated
 * and optionally if they have the required role.
 * 
 * @param children - The content to render if the user is authenticated
 * @param requiredRole - Optional role that the user must have to access the route
 */
export function WithAuth({ children, requiredRole }: WithAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Auth check:', { data, error, pathname });
        
        if (!isMounted) return;
        
        if (error || !data?.session) {
          setIsAuthenticated(false);
          setIsChecking(false);
          if (pathname !== '/login' && !pathname.startsWith('/auth')) {
            const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
            router.push(redirectUrl);
          }
          return;
        }

        // If a specific role is required, check if the user has it
        if (requiredRole) {
          const userRole = data.session.user.user_metadata.role;

          if (!userRole || userRole !== requiredRole) {
            setIsAuthenticated(false);
            setIsChecking(false);
            // Redirect to unauthorized page or home page
            router.push('/');
            return;
          }
        }

        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (!isMounted) return;
        setIsAuthenticated(false);
        setIsChecking(false);
        if (pathname !== '/login' && !pathname.startsWith('/auth')) {
          const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
          router.push(redirectUrl);
        }
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session, pathname);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setIsChecking(false);
        if (pathname !== '/login' && !pathname.startsWith('/auth')) {
          const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
          router.push(redirectUrl);
        }
      } else if (event === 'SIGNED_IN' && session) {
        // Re-check auth when signed in to handle role requirements
        await checkAuth();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Don't redirect on token refresh, just update state
        setIsAuthenticated(true);
        setIsChecking(false);
      }
    });

    // Initial auth check
    checkAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, requiredRole, pathname]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}