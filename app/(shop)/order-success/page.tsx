'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WithAuth } from '@/providers/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Calendar, CreditCard } from 'lucide-react';

/**
 * Protected Route: Authenticated users only
 * Purchase confirmation, order summary
 */

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<{
    id: string;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      image_url: string | null;
    }>;
    shipping_address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  } | null>(null);
  
  const orderId = searchParams.get('order_id');
  const orderNumber = searchParams.get('order_number');

  useEffect(() => {
    // In a real app, you would fetch order details from the API
    // For now, we'll simulate order data
    if (orderId) {
      setOrderDetails({
        id: orderId,
        order_number: orderNumber || `ORD-${Date.now()}`,
        total: 89.97,
        status: 'confirmed',
        created_at: new Date().toISOString(),
        items: [
          {
            id: '1',
            name: 'Monstera Deliciosa',
            price: 29.99,
            quantity: 2,
            image_url: null
          },
          {
            id: '2', 
            name: 'Plant Care Kit',
            price: 29.99,
            quantity: 1,
            image_url: null
          }
        ],
        shipping_address: {
          street: '123 Green Street',
          city: 'Plant City',
          state: 'CA',
          zip: '90210'
        }
      });
    }
  }, [orderId, orderNumber]);

  if (!orderId) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">No order information found.</p>
            <Button onClick={() => router.push('/shop')}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      {orderDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Number:</span>
                <Badge variant="secondary">{orderDetails.order_number}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge className="bg-green-100 text-green-800">
                  {orderDetails.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold">${orderDetails.total.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Ordered on {new Date(orderDetails.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderDetails.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url || '/placeholder.jpg'} alt={item.name} width={80} height={80} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">🌱</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p>{orderDetails.shipping_address.street}</p>
                <p>
                  {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.zip}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>• You'll receive an email confirmation shortly</p>
                <p>• We'll send tracking information when your order ships</p>
                <p>• Estimated delivery: 3-5 business days</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button 
          variant="outline" 
          onClick={() => router.push('/shop')}
          className="flex-1 sm:flex-none"
        >
          Continue Shopping
        </Button>
        <Button 
          onClick={() => router.push('/dashboard')}
          className="flex-1 sm:flex-none"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <WithAuth>
      <OrderSuccessContent />
    </WithAuth>
  );
}