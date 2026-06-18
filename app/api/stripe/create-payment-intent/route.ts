import { NextRequest } from 'next/server';
import { StripeService } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse, createValidationErrorResponse } from '@/lib/api/responses';
import { object, pipe, number, minValue, optional, string, uuid, email, safeParse } from 'valibot';

// Validation schema for payment intent creation
const createPaymentIntentSchema = object({
  amount: pipe(number(), minValue(0.5)), // Minimum $0.50
  currency: optional(string(), 'usd'),
  customerEmail: pipe(string(), email()),
  customerName: optional(string()),
  orderId: pipe(string(), uuid()),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = safeParse(createPaymentIntentSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.issues, 'Invalid request data');
    }

    const { amount, currency, customerEmail, customerName, orderId } = validation.output;

    // Verify the order belongs to the authenticated user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return createErrorResponse('Order not found', 404);
    }

    // Create or retrieve Stripe customer
    const customer = await StripeService.createOrRetrieveCustomer({
      email: customerEmail,
      name: customerName,
      userId: user.id,
    });

    // Create payment intent
    const paymentIntent = await StripeService.createPaymentIntent({
      amount,
      currency,
      customerId: customer.id,
      metadata: {
        customerEmail,
        orderId,
        userId: user.id,
      },
    });

    // Update order with Stripe information
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        currency: currency.toUpperCase(),
        payment_status: 'pending',
        stripe_customer_id: customer.id,
        stripe_payment_intent_id: paymentIntent.id,
        total_amount: amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order with Stripe info:', updateError);
      return createErrorResponse('Failed to update order', 500);
    }

    return createSuccessResponse({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}