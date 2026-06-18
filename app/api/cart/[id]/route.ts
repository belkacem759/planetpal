import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { cartService } from '@/lib/db';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth';

// PUT /api/cart/[id] - Update cart item quantity (authenticated user)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,

    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const { error: authError, user } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return handleApiError(createError.validation('Quantity must be at least 1'));
    }

    const result = await cartService.updateQuantity(user.id, id, quantity);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    // Return the full cart data after update
    const cartResult = await cartService.getUserCart(user.id);
    if (!cartResult.success) {
      return handleApiError(new Error(cartResult.error));
    }

    return createSuccessResponse(cartResult.data);
  } catch (error) {
    return handleApiError(error, `/api/cart/${id}`);
  }
}

// DELETE /api/cart/[id] - Remove item from cart (authenticated user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,

    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const { error: authError, user } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const result = await cartService.removeFromCart(user.id, id);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, `/api/cart/${id}`);
  }
}