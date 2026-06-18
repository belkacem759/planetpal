'use client';

import * as React from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import { PaymentStatus, usePaymentStatus } from "@/components/ui/payment-status";
import { object, pipe, string, email, minLength, regex, optional, safeParse } from 'valibot';



// Validation schemas
const checkoutFormSchema = object({
  address: pipe(string(), minLength(1)),
  city: pipe(string(), minLength(1)),
  email: pipe(string(), email()),
  firstName: pipe(string(), minLength(1)),
  lastName: pipe(string(), minLength(1)),
  phone: optional(string()),
  state: pipe(string(), minLength(1)),
  zipCode: pipe(string(), regex(/^\d{5}(-\d{4})?$/)),
});

interface CheckoutFormData {
  address: string;
  city: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  state: string;
  zipCode: string;
}

interface StripeCheckoutFormProps {
  amount: number;
  className?: string;
  currency?: string;
  initialData?: Partial<CheckoutFormData>;
  onError: (error: Error) => void;
  onSuccess: (paymentIntentId: string) => void;
  orderId: string;
}

// Card Element styling
const cardElementOptions = {
  hidePostalCode: true, // We collect this separately
  style: {
    base: {
      '::placeholder': {
        color: '#aab7c4',
      },
      color: '#424770',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// Internal form component that uses Stripe hooks
const StripeCheckoutFormInner: React.FC<StripeCheckoutFormProps> = ({
  amount,
  className,
  currency = 'usd',
  initialData = {},
  onError,
  onSuccess,
  orderId,
}) => {
  const { message: statusMessage, status: paymentStatus, updateStatus } = usePaymentStatus();
  const stripe = useStripe();
  const elements = useElements();
  
  const [formData, setFormData] = React.useState<CheckoutFormData>({
    address: initialData.address || "",
    city: initialData.city || "",
    email: initialData.email || "",
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    phone: initialData.phone || "",
    state: initialData.state || "",
    zipCode: initialData.zipCode || "",
  });

  const [errors, setErrors] = React.useState<Partial<CheckoutFormData>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof CheckoutFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [cardComplete, setCardComplete] = React.useState(false);
  const [cardError, setCardError] = React.useState<string | null>(null);

  const handleInputChange = (field: keyof CheckoutFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputBlur = (field: keyof CheckoutFormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field] || "");
  };

  const validateField = (field: keyof CheckoutFormData, value: string) => {
    const fieldSchema = checkoutFormSchema.entries[field];
    if (!fieldSchema) {return true;}

    const result = safeParse(fieldSchema, value);
    const error = result.success ? undefined : result.issues[0]?.message;
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return result.success;
  };

  const validateForm = () => {
    const result = safeParse(checkoutFormSchema, formData);
    
    if (!result.success) {
      const newErrors: Partial<CheckoutFormData> = {};
      result.issues.forEach(issue => {
        const field = issue.path?.[0]?.key as keyof CheckoutFormData;
        if (field) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      
      // Mark all fields as touched
      const allTouched = Object.keys(formData).reduce((acc, field) => {
        acc[field as keyof CheckoutFormData] = true;
        return acc;
      }, {} as Record<keyof CheckoutFormData, boolean>);
      setTouched(allTouched);
      
      return false;
    }
    
    return true;
  };

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !validateForm() || !cardComplete) {
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);
    updateStatus('processing', 'Creating payment intent...');

    try {
      // Create payment intent
      const response = await api.post('/api/stripe/create-payment-intent', {
        amount,
        currency,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        orderId,
      }, { requiresAuth: true });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { data } = await response.json();
      const { clientSecret } = data;

      updateStatus('processing', 'Confirming payment...');

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            billing_details: {
              address: {
                city: formData.city,
                line1: formData.address,
                postal_code: formData.zipCode,
                state: formData.state,
              },
              email: formData.email,
              name: `${formData.firstName} ${formData.lastName}`,
              phone: formData.phone,
            },
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        updateStatus('failed', stripeError.message || 'Payment failed');
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        updateStatus('processing', 'Updating order with shipping information...');
        
        // Update order with shipping address and create order items
        try {
          const updateResponse = await api.put(`/api/orders/${orderId}`, {
            payment_status: 'paid',
            shipping_address: {
              address_line_1: formData.address,
              city: formData.city,
              country: 'US',
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              postal_code: formData.zipCode,
              state: formData.state,
            },
            status: 'processing'
          }, { requiresAuth: true });

          if (!updateResponse.ok) {
            console.error('Failed to update order with shipping address');
          }
        } catch (error) {
          console.error('Error updating order:', error);
        }
        
        updateStatus('succeeded', 'Payment completed successfully!');
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        updateStatus('requires_action', 'Additional authentication required');
      } else {
        updateStatus('failed', 'Payment was not completed successfully');
        throw new Error('Payment was not completed successfully');
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setPaymentError(errorMessage);
      updateStatus('failed', errorMessage);
      onError(new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: keyof CheckoutFormData) => {
    return touched[field] && errors[field];
  };

  return (
    <form className={cn("space-y-6", className)} onSubmit={handleSubmit}>
      {/* Payment Status */}
      <PaymentStatus message={statusMessage} status={paymentStatus} />

      {/* Error Alert */}
      {paymentError && (
        <Alert variant="destructive">
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              className={getFieldError("email") ? "border-destructive" : ""}
              disabled={isSubmitting}
              id="email"
              onBlur={handleInputBlur("email")}
              onChange={handleInputChange("email")}
              placeholder="your@email.com"
              type="email"
              value={formData.email}
            />
            {getFieldError("email") && (
              <p className="text-sm text-destructive mt-1">
                {getFieldError("email")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                className={getFieldError("firstName") ? "border-destructive" : ""}
                disabled={isSubmitting}
                id="firstName"
                onBlur={handleInputBlur("firstName")}
                onChange={handleInputChange("firstName")}
                placeholder="John"
                type="text"
                value={formData.firstName}
              />
              {getFieldError("firstName") && (
                <p className="text-sm text-destructive mt-1">
                  {getFieldError("firstName")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                className={getFieldError("lastName") ? "border-destructive" : ""}
                disabled={isSubmitting}
                id="lastName"
                onBlur={handleInputBlur("lastName")}
                onChange={handleInputChange("lastName")}
                placeholder="Doe"
                type="text"
                value={formData.lastName}
              />
              {getFieldError("lastName") && (
                <p className="text-sm text-destructive mt-1">
                  {getFieldError("lastName")}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              className={getFieldError("phone") ? "border-destructive" : ""}
              disabled={isSubmitting}
              id="phone"
              onBlur={handleInputBlur("phone")}
              onChange={handleInputChange("phone")}
              placeholder="(555) 123-4567"
              type="tel"
              value={formData.phone}
            />
            {getFieldError("phone") && (
              <p className="text-sm text-destructive mt-1">
                {getFieldError("phone")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              className={getFieldError("address") ? "border-destructive" : ""}
              disabled={isSubmitting}
              id="address"
              onBlur={handleInputBlur("address")}
              onChange={handleInputChange("address")}
              placeholder="123 Main St"
              type="text"
              value={formData.address}
            />
            {getFieldError("address") && (
              <p className="text-sm text-destructive mt-1">
                {getFieldError("address")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                className={getFieldError("city") ? "border-destructive" : ""}
                disabled={isSubmitting}
                id="city"
                onBlur={handleInputBlur("city")}
                onChange={handleInputChange("city")}
                placeholder="New York"
                type="text"
                value={formData.city}
              />
              {getFieldError("city") && (
                <p className="text-sm text-destructive mt-1">
                  {getFieldError("city")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                className={getFieldError("state") ? "border-destructive" : ""}
                disabled={isSubmitting}
                id="state"
                onBlur={handleInputBlur("state")}
                onChange={handleInputChange("state")}
                placeholder="NY"
                type="text"
                value={formData.state}
              />
              {getFieldError("state") && (
                <p className="text-sm text-destructive mt-1">
                  {getFieldError("state")}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              className={getFieldError("zipCode") ? "border-destructive" : ""}
              disabled={isSubmitting}
              id="zipCode"
              onBlur={handleInputBlur("zipCode")}
              onChange={handleInputChange("zipCode")}
              placeholder="10001"
              type="text"
              value={formData.zipCode}
            />
            {getFieldError("zipCode") && (
              <p className="text-sm text-destructive mt-1">
                {getFieldError("zipCode")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Card Details *</Label>
            <div className="mt-2 p-3 border rounded-md">
              <CardElement
                onChange={handleCardChange}
                options={cardElementOptions}
              />
            </div>
            {cardError && (
              <p className="text-sm text-destructive mt-1">{cardError}</p>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>🔒 Your payment information is secure and encrypted.</p>
            <p>We use Stripe for secure payment processing.</p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          className="w-full"
          disabled={isSubmitting || !stripe || !cardComplete}
          size="lg"
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" size="sm" />
              Processing Payment...
            </>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
};

export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = (props) => {
  return <StripeCheckoutFormInner {...props} />;
};

export type { StripeCheckoutFormProps, CheckoutFormData };