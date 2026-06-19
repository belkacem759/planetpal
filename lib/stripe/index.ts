import Stripe from 'stripe';

// Lazily instantiate Stripe so importing this module never throws at build/
// load time. The secret key is only required when a Stripe API call is
// actually made (request time), not during `next build` page-data collection.
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2026-05-27.dahlia',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Proxy preserves the `import { stripe }` API while deferring initialization
// until the first property access. Methods are bound to the real instance.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const instance = getStripe();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

// Stripe service class for payment operations
export class StripeService {
  /**
   * Create a payment intent for the checkout process
   */
  static async createPaymentIntent({
    amount,
    currency = 'usd',
    customerId,
    metadata = {},
  }: {
    amount: number;
    currency?: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    try {
      // Generate a unique idempotency key that includes order ID and timestamp
      const idempotencyKey = `${metadata.orderId}-${Date.now()}`;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        automatic_payment_methods: {
          enabled: true,
        },
        currency,
        customer: customerId,
        metadata,
      }, {
        idempotencyKey,
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Create or retrieve a Stripe customer
   */
  static async createOrRetrieveCustomer({
    email,
    name,
    userId,
  }: {
    email: string;
    name?: string;
    userId: string;
  }): Promise<Stripe.Customer> {
    try {
      // First, try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer if not found
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
        name,
      });

      return customer;
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      throw new Error('Failed to create or retrieve customer');
    }
  }

  /**
   * Retrieve a payment intent by ID
   */
  static async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  /**
   * Confirm a payment intent
   */
  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw new Error('Failed to confirm payment intent');
    }
  }

  /**
   * Construct webhook event from raw body and signature
   */
  static constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle webhook events
   */
  static async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('Payment succeeded:', paymentIntent.id);
          // Handle successful payment - update order status, send confirmation email, etc.
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log('Payment failed:', failedPayment.id);
          // Handle failed payment - update order status, notify user, etc.
          break;

        case 'customer.created':
          const customer = event.data.object as Stripe.Customer;
          console.log('Customer created:', customer.id);
          // Handle new customer creation
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }
}

// Export types for use in other files
export type {
  Stripe,
};