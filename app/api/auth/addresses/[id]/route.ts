import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';
import { AddressUpdateSchema, validateData } from '@/lib/validation';
import { createMiddleware } from '@/lib/middleware';
import { getAuthenticatedUser } from '@/lib/auth';

const middleware = createMiddleware({
  requireAuth: true,
  enableRateLimit: true,
  
});

// PUT /api/auth/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validation = validateData(AddressUpdateSchema, body);
    if (!validation.success) {
      return handleApiError(createError.validation(
        `Validation failed: ${validation.errors?.join(', ')}`,
        validation.errors
      ));
    }

    // Get current addresses
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', user.id)
      .single();

    if (userError) {
      return handleApiError(createError.database('Failed to fetch addresses', userError));
    }

    const currentAddresses = (userData?.addresses as any[]) || [];
    const addressIndex = currentAddresses.findIndex((addr: any) => addr.id === params.id);

    if (addressIndex === -1) {
      return handleApiError(createError.notFound('Address', params.id));
    }

    // Check ownership
    if (currentAddresses[addressIndex].user_id !== user.id) {
      return handleApiError(createError.forbidden('You can only update your own addresses'));
    }

    // Update the address
    const updatedAddress = {
      ...currentAddresses[addressIndex],
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    // If this is set as default, unset other defaults of the same type
    if (validation.data?.is_default && validation.data?.type) {
      currentAddresses.forEach((addr: any, index: number) => {
        if (index !== addressIndex && addr.type === validation.data?.type) {
          addr.is_default = false;
        }
      });
    }

    // Update the address in the array
    currentAddresses[addressIndex] = updatedAddress;

    // Update user's addresses
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        addresses: currentAddresses,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return handleApiError(createError.database('Failed to update address', updateError));
    }

    return createSuccessResponse(updatedAddress);
  } catch (error) {
    return handleApiError(error, `/api/auth/addresses/${params.id}`);
  }
}

// DELETE /api/auth/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Apply middleware
  const middlewareResponse = await middleware(request);
  if (middlewareResponse) return middlewareResponse;

  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const supabase = await createClient();

    // Get current addresses
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', user.id)
      .single();

    if (userError) {
      return handleApiError(createError.database('Failed to fetch addresses', userError));
    }

    const currentAddresses = (userData?.addresses as any[]) || [];
    const addressIndex = currentAddresses.findIndex((addr: any) => addr.id === params.id);

    if (addressIndex === -1) {
      return handleApiError(createError.notFound('Address', params.id));
    }

    // Check ownership
    if (currentAddresses[addressIndex].user_id !== user.id) {
      return handleApiError(createError.forbidden('You can only delete your own addresses'));
    }

    // Remove the address from the array
    const updatedAddresses = currentAddresses.filter((addr: any) => addr.id !== params.id);

    // Update user's addresses
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        addresses: updatedAddresses,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return handleApiError(createError.database('Failed to delete address', updateError));
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, `/api/auth/addresses/${params.id}`);
  }
}