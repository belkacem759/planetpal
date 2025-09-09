import { cartService } from '@/lib/db';
import { createSuccessResponse, handleApiError, createError } from '@/lib/errors';
import { createMiddleware } from '@/lib/middleware';
import { CartInsertSchema, validateData } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

// GET /api/cart - Get user's cart (authenticated user)
export async function GET(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true
    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const result = await cartService.getUserCart(user.id);

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/cart');
  }
}

// POST /api/cart - Add item to cart (authenticated user)
export async function POST(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return handleApiError(authError || createError.unauthorized());
    }

    const body = await request.json();

    // Validate input
    const validation = validateData(CartInsertSchema, {
      ...body,
      user_id: user.id
    });
    if (!validation.success) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    const result = await cartService.addToCart(
      user.id,
      body.product_id,
      body.quantity || 1
    );

    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/cart');
  }
}