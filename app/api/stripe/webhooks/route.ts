import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { StripeService } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/api/responses';
import Stripe from 'stripe';

// Webhook endpoint for Stripe events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return createErrorResponse('Missing stripe-signature header', 400);
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return createErrorResponse('Webhook secret not configured', 500);
    }

    // Verify webhook signature
    const event = StripeService.constructWebhookEvent(body, signature, webhookSecret);

    if (!event) {
      return createErrorResponse('Invalid webhook signature', 400);
    }

    const supabase = await createClient();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Update order status to completed
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              payment_method: paymentIntent.payment_method_types[0] || 'card',
              payment_metadata: {
                payment_intent_id: paymentIntent.id,
                amount_received: paymentIntent.amount_received,
                currency: paymentIntent.currency,
                payment_method_types: paymentIntent.payment_method_types,
              },
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          if (error) {
            console.error('Error updating order on payment success:', error);
          } else {
            console.log(`Order ${orderId} payment succeeded`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Update order status to failed
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              status: 'payment_failed',
              payment_metadata: {
                payment_intent_id: paymentIntent.id,
                last_payment_error: paymentIntent.last_payment_error,
                failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
              },
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          if (error) {
            console.error('Error updating order on payment failure:', error);
          } else {
            console.log(`Order ${orderId} payment failed`);
          }
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Update order status to canceled
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'canceled',
              status: 'canceled',
              payment_metadata: {
                payment_intent_id: paymentIntent.id,
                cancellation_reason: paymentIntent.cancellation_reason || 'Payment canceled',
              },
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          if (error) {
            console.error('Error updating order on payment cancellation:', error);
          } else {
            console.log(`Order ${orderId} payment canceled`);
          }
        }
        break;
      }

      case 'customer.created':
      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        console.log(`Customer ${event.type}:`, customer.id);
        // Additional customer handling logic can be added here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return createSuccessResponse({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      500
    );
  }
}