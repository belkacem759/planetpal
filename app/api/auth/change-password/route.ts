import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';
import { ChangePasswordSchema, validateData } from '@/lib/validation';
import { createMiddleware } from '@/lib/middleware';
import { getAuthenticatedUser } from '@/lib/auth';

const middleware = createMiddleware({
  enableRateLimit: true,
  requireAuth: true,

});

// POST /api/auth/change-password - Change user password
export async function POST(request: NextRequest) {
  // Apply middleware
  const middlewareResponse = await middleware(request);
  if (middlewareResponse) {return middlewareResponse;}

  try {
    const { error: authError, user } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const supabase = await createClient();

    const body = await request.json();

    // Validate input
    const validation = validateData(ChangePasswordSchema, body);
    if (!validation.success) {
      return handleApiError(createError.validation(
        `Validation failed: ${validation.errors?.join(', ')}`,
        validation.errors
      ));
    }

    if (!validation.data) {
      return handleApiError(createError.validation('Invalid request data'));
    }

    const { current_password, new_password } = validation.data;

    // First, verify the current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current_password,
    });

    if (signInError) {
      return handleApiError(createError.validation('Current password is incorrect'));
    }

    // Update the password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) {
      return handleApiError(createError.database('Failed to update password', updateError));
    }

    return createSuccessResponse({ 
      message: 'Password updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, '/api/auth/change-password');
  }
}