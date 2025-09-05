'use client';

/**
 * Protected Route: Authenticated users only
 * Shipping address form, order summary, payment
 */

import { CheckoutForm, CheckoutFormData } from '@/components/organisms/checkout-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartQuery, useCheckoutMutation, CheckoutData } from '@/hooks';
import { WithServerAuth } from '@/providers/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function CheckoutPageContent() {
  const router = useRouter();
  const { data: cart } = useCartQuery();
  const checkoutMutation = useCheckoutMutation();

  const handleCheckout = async (formData: CheckoutFormData) => {
    try {
      // Transform form data to checkout data format
      const checkoutData: CheckoutData = {
        email: formData.email,
        phone: formData.phone,
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_line_1: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: 'US' // Default country
        },
        payment_method: 'credit_card' // Default payment method
      };
      
      const result = await checkoutMutation.mutateAsync(checkoutData);
      router.push(`/order-success?orderId=${result.order.id}`);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
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
          <CheckoutForm
            onSubmit={handleCheckout}
            isSubmitting={checkoutMutation.isPending}
            error={checkoutMutation.error ? new Error(checkoutMutation.error.message) : null}
          />
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
  return (
    <WithServerAuth>
      <CheckoutPageContent />
    </WithServerAuth>
  );
}