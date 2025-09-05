import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { CartService } from '@/lib/db';
import { CartInsertSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse } from '@/lib/errors';
import { validateData } from '@/lib/validation';

const cartService = new CartService();

// GET /api/cart - Get user's cart (authenticated user)
export async function GET(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    // Extract user from middleware result (this would need to be passed through)
    // For now, we'll assume user ID is available in request context
    const userId = request.headers.get('x-user-id'); // This would be set by auth middleware
    
    if (!userId) {
      return handleApiError(new Error('User ID not found'));
    }

    const result = await cartService.getUserCart(userId);
    
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

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return handleApiError(new Error('User ID not found'));
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateData(CartInsertSchema, {
      ...body,
      user_id: userId
    });
    if (!validation.success) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    const result = await cartService.addToCart(
      userId,
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