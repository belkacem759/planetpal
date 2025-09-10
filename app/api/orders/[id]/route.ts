import { NextRequest } from 'next/server';
import { createMiddleware } from '@/lib/middleware';
import { OrderService } from '@/lib/db';
import { handleApiError, createSuccessResponse, createError } from '@/lib/errors';

const orderService = new OrderService();

// GET /api/orders/[id] - Get order by ID (authenticated user, owner only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Get the order with order items and product details
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price_at_purchase,
          product:products (
            id,
            name,
            slug,
            images
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (orderError || !orderData) {
      return handleApiError(createError.notFound('Order', id));
    }

    // Transform the data to match the expected Order interface
    const transformedOrder = {
      ...orderData,
      order_number: orderData.id, // Use ID as order number if not present
      items: orderData.order_items?.map((item: any) => ({
        id: item.id,
        order_id: id,
        product_id: item.product?.id,
        product_name: item.product?.name,
        product_slug: item.product?.slug,
        product_image_url: item.product?.images?.[0],
        quantity: item.quantity,
        unit_price: item.price_at_purchase,
        total_price: item.quantity * item.price_at_purchase,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || []
    };

    return createSuccessResponse(transformedOrder);
  } catch (error) {
    return handleApiError(error, `/api/orders/${params.id}`);
  }
}