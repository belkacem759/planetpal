import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { orderService, orderItemService } from '@/lib/db';
import { OrderInsertSchema, PaginationSchema } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createPaginatedResponse } from '@/lib/errors';
import { validateData } from '@/lib/validation';

// GET /api/orders - Get user's orders (authenticated user)
export async function GET(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const user = (request as any).user;
    
    if (!user || !user.id) {
      return handleApiError(new Error('User ID not found'));
    }
    
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination
    const paginationValidation = validateData(PaginationSchema, { page, limit });
    if (!paginationValidation.success) {
      return handleApiError(new Error('Invalid pagination parameters'));
    }

    const result = await orderService.getUserOrders(userId);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleApiError(error, '/api/orders');
  }
}

// POST /api/orders - Create order (authenticated user)
export async function POST(request: NextRequest) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true,
  
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) return middlewareResult;

    const user = (request as any).user;
    
    if (!user || !user.id) {
      return handleApiError(new Error('User ID not found'));
    }
    
    const userId = user.id;

    const body = await request.json();
    const { cart_items, ...orderData } = body;
    
    // Validate input
    const validation = validateData(OrderInsertSchema, {
      ...orderData,
      user_id: userId
    });
    if (!validation.success || !validation.data) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    // Create the order first
    const orderResult = await orderService.createOrder(userId, validation.data);
    
    if (!orderResult.success) {
      return handleApiError(new Error(orderResult.error));
    }

    // Create order items if cart_items are provided
    if (cart_items && Array.isArray(cart_items) && cart_items.length > 0) {
      const orderItems = cart_items.map((item: any) => ({
        order_id: orderResult.data.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const orderItemsResult = await orderItemService.createOrderItems(orderItems);
      
      if (!orderItemsResult.success) {
        // Log error but don't fail the order creation
        console.error('Failed to create order items:', orderItemsResult.error);
      }
    }

    return createSuccessResponse(orderResult.data);
  } catch (error) {
    return handleApiError(error, '/api/orders');
  }
}