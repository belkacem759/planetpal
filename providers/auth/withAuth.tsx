'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data?.session) {
        router.push('/auth/login');
        return;
      }

      // If a specific role is required, check if the user has it
      if (requiredRole) {
        const userRole = data.session.user.user_metadata.role;
        
        if (!userRole || userRole !== requiredRole) {
          // Redirect to unauthorized page or home page
          router.push('/');
          return;
        }
      }
    };

    checkAuth();
  }, [router, requiredRole, supabase.auth]);

  return <>{children}</>;
}