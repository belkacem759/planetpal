'use client';

/**
 * Protected Route: Authenticated users only
 * Shipping address form, order summary, payment
 */

import { StripeCheckoutForm } from '@/components/organisms/stripe-checkout-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartQuery } from '@/hooks';
import { StripeProvider } from '@/components/providers/stripe-provider';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';

function CheckoutPageContent() {
  const router = useRouter();
  const { data: cart } = useCartQuery();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    router.push(`/order-success?paymentIntentId=${paymentIntentId}&orderId=${orderId}`);
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment failed:', error);
    // You can add toast notification here
  };

  const orderSummary = {
    subtotal: cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0,
    tax: 0,
    shipping: 0,
    total: 0
  };

  orderSummary.tax = orderSummary.subtotal * 0.08; // 8% tax
  orderSummary.shipping = orderSummary.subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  orderSummary.total = orderSummary.subtotal + orderSummary.tax + orderSummary.shipping;

  // Create order when cart is available
  useEffect(() => {
    const createOrder = async () => {
      if (!cart?.items?.length || orderId) return;

      setIsProcessing(true);
      setOrderError(null);

      try {
        const response = await api.post('/api/orders', {
          total_amount: orderSummary.total,
          status: 'pending',
          payment_status: 'pending'
        }, { requiresAuth: true });

        if (!response.ok) {
          const errorData = await response.json();
          // If authentication failed, redirect to login
          if (response.status === 401 || response.status === 307) {
            router.push('/login?redirect=/checkout');
            return;
          }
          throw new Error(errorData.error || 'Failed to create order');
        }

        const { data } = await response.json();
        setOrderId(data.id);
      } catch (error) {
        console.error('Error creating order:', error);
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('No authentication token')) {
          router.push('/login?redirect=/checkout');
          return;
        }
        setOrderError(error instanceof Error ? error.message : 'Failed to create order');
      } finally {
        setIsProcessing(false);
      }
    };

    createOrder();
  }, [cart?.items, orderId, orderSummary.total, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Link>
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600">
          Complete your order by providing your shipping information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          {orderError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">Error creating order: {orderError}</p>
            </div>
          )}

          {isProcessing && !orderId && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">Creating order...</p>
            </div>
          )}

          {orderId && (
            <StripeProvider clientSecret={clientSecret || undefined}>
              <StripeCheckoutForm
                orderId={orderId}
                amount={Math.round(orderSummary.total * 100)} // Convert to cents
                currency="usd"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </StripeProvider>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart?.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <hr className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${orderSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}