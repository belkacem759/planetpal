import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';

type WithServerAuthProps = {
  children: ReactNode;
  requiredRole?: string;
};

/**
 * A server component that protects routes by checking if the user is authenticated
 * and optionally if they have the required role.
 * 
 * @param children - The content to render if the user is authenticated
 * @param requiredRole - Optional role that the user must have to access the route
 */
export async function WithServerAuth({ children, requiredRole }: WithServerAuthProps) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  // If a specific role is required, check if the user has it
  if (requiredRole) {
    let userRole: string | undefined = user.user_metadata?.role as string | undefined;

    if (!userRole) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      userRole = (profile as { role?: string } | null)?.role;
    }

    if (!userRole || userRole !== requiredRole) {
      // Redirect to unauthorized page or home page
      redirect('/');
    }
  }

  return <>{children}</>;
}