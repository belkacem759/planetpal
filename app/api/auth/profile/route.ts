import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';
import { UserUpdateSchema, validateData } from '@/lib/validation';
import { createMiddleware } from '@/lib/middleware';
import { getAuthenticatedUser } from '@/lib/auth';

const middleware = createMiddleware({
  requireAuth: true,
  enableRateLimit: true,

});

// PUT /api/auth/profile - Update user profile
export async function PUT(request: NextRequest) {
  // Apply middleware
  const middlewareResponse = await middleware(request);
  if (middlewareResponse) return middlewareResponse;

  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const supabase = await createClient();

    const body = await request.json();

    // Validate input
    const validation = validateData(UserUpdateSchema, body);
    if (!validation.success) {
      return handleApiError(createError.validation(
        `Validation failed: ${validation.errors?.join(', ')}`,
        validation.errors
      ));
    }

    // Update user profile in the users table
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (updateError) {
      return handleApiError(createError.database('Failed to update profile', updateError));
    }

    // Remove sensitive fields from response
    const { password_hash, ...safeUser } = updatedUser;

    return createSuccessResponse(safeUser);
  } catch (error) {
    return handleApiError(error, '/api/auth/profile');
  }
}