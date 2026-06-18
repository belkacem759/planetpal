import { createError, createSuccessResponse, handleApiError } from '@/lib/errors';
import { createMiddleware } from '@/lib/middleware';
import { OrderService } from '@/lib/db';
import { OrderUpdateSchema } from '@/lib/validation';
import { validateData } from '@/lib/validation';
import { NextRequest } from 'next/server';

const orderService = new OrderService();

// GET /api/orders/[id] - Get order by ID (authenticated user, owner only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true
    });

    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const user = (request as any).user;

    if (!user || !user.id) {
      return handleApiError(new Error('User ID not found'));
    }

    const userId = user.id;
    const { id } = await params;

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
      items: orderData.order_items?.map((item: any) => ({
        created_at: item.created_at,
        id: item.id,
        image_url: item.product?.images?.[0], // Frontend expects 'image_url' not 'product_image_url'
        name: item.product?.name, // Frontend expects 'name' not 'product_name'
        order_id: id,
        price: item.price_at_purchase, // Frontend expects 'price' for calculations
        product_id: item.product?.id,
        product_image_url: item.product?.images?.[0],
        product_name: item.product?.name,
        product_slug: item.product?.slug,
        quantity: item.quantity,
        total_price: item.quantity * item.price_at_purchase,
        unit_price: item.price_at_purchase,
        updated_at: item.updated_at
      })) || [],
      order_number: orderData.id, // Use ID as order number since order_number column doesn't exist
      shipping_address: orderData.shipping_address || {
        address_line_1: '',
        address_line_2: '',
        city: '',
        country: '',
        first_name: '',
        last_name: '',
        postal_code: '',
        state: ''
      }
    };

    return createSuccessResponse(transformedOrder);
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, `/api/orders/${id}`);
  }
}

// PUT /api/orders/[id] - Update order (authenticated user, owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const middleware = createMiddleware({
      enableRateLimit: true,
      requireAuth: true
    });
    
    const middlewareResult = await middleware(request);
    if (middlewareResult) {return middlewareResult;}

    const user = (request as any).user;
    
    if (!user || !user.id) {
      return handleApiError(new Error('User ID not found'));
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = validateData(OrderUpdateSchema, body);
    if (!validation.success || !validation.data) {
      return handleApiError(new Error(`Validation failed: ${validation.errors?.join(', ')}`));
    }

    // Check if user owns this order
    const existingOrder = await orderService.findById(id);
    if (!existingOrder.success || existingOrder.data?.user_id !== user.id) {
      return handleApiError(createError.notFound('Order', id));
    }

    const result = await orderService.update(id, validation.data);
    
    if (!result.success) {
      return handleApiError(new Error(result.error));
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, `/api/orders/${id}`);
  }
}