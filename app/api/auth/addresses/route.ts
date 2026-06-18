import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';
import { AddressInsertSchema, validateData } from '@/lib/validation';
import { createMiddleware } from '@/lib/middleware';
import { getAuthenticatedUser } from '@/lib/auth';

const middleware = createMiddleware({
  enableRateLimit: true,
  requireAuth: true
});

// GET /api/auth/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  // Apply middleware
  const middlewareResponse = await middleware(request);
  if (middlewareResponse) {return middlewareResponse;}

  try {
    const { error: authError, user } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const supabase = await createClient();

    // Get user's addresses from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', user.id)
      .single();

    if (userError) {
      return handleApiError(createError.database('Failed to fetch addresses', userError));
    }

    const addresses = userData?.addresses || [];

    return createSuccessResponse(addresses);
  } catch (error) {
    return handleApiError(error, '/api/auth/addresses');
  }
}

const postMiddleware = createMiddleware({
  enableRateLimit: true,
  requireAuth: true,
  
});

// POST /api/auth/addresses - Create new address
export async function POST(request: NextRequest) {
  // Apply middleware
  const middlewareResponse = await postMiddleware(request);
  if (middlewareResponse) {return middlewareResponse;}

  try {
    const { error: authError, user } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const supabase = await createClient();

    const body = await request.json();

    // Validate input
    const validation = validateData(AddressInsertSchema, body);
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
      return handleApiError(createError.database('Failed to fetch current addresses', userError));
    }

    const currentAddresses = (userData?.addresses as any[]) || [];

    // Create new address with ID and timestamps
    const newAddress = {
      id: crypto.randomUUID(),
      user_id: user.id,
      ...validation.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If this is set as default, unset other defaults of the same type
    if (newAddress.is_default) {
      currentAddresses.forEach((addr: any) => {
        if (addr.type === newAddress.type) {
          addr.is_default = false;
        }
      });
    }

    // Add new address to the array
    const updatedAddresses = [...currentAddresses, newAddress];

    // Update user's addresses
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        addresses: updatedAddresses,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return handleApiError(createError.database('Failed to create address', updateError));
    }

    return createSuccessResponse(newAddress, { timestamp: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error, '/api/auth/addresses');
  }
}