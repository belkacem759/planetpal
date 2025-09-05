import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { CartService } from '@/lib/db';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';

const cartService = new CartService();

// PUT /api/cart/[id] - Update cart item quantity (authenticated user)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
  
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return handleApiError(new Error('User ID not found'));
    }

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return handleApiError(createError.validation('Quantity must be at least 1'));
    }

    const result = await cartService.updateQuantity(userId, params.id, quantity);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, `/api/cart/${params.id}`);
  }
}

// DELETE /api/cart/[id] - Remove item from cart (authenticated user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
  
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return handleApiError(new Error('User ID not found'));
    }

    const result = await cartService.removeFromCart(userId, params.id);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, `/api/cart/${params.id}`);
  }
}