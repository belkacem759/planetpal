'use client';

import * as React from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
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
import * as v from 'valibot';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Validation schemas
const checkoutFormSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  firstName: v.pipe(v.string(), v.minLength(1)),
  lastName: v.pipe(v.string(), v.minLength(1)),
  address: v.pipe(v.string(), v.minLength(1)),
  city: v.pipe(v.string(), v.minLength(1)),
  state: v.pipe(v.string(), v.minLength(1)),
  zipCode: v.pipe(v.string(), v.regex(/^\d{5}(-\d{4})?$/)),
  phone: v.optional(v.string()),
});

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
}

interface StripeCheckoutFormProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: Error) => void;
  className?: string;
  initialData?: Partial<CheckoutFormData>;
}

// Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true, // We collect this separately
};

// Internal form component that uses Stripe hooks
const StripeCheckoutFormInner: React.FC<StripeCheckoutFormProps> = ({
  orderId,
  amount,
  currency = 'usd',
  onSuccess,
  onError,
  className,
  initialData = {},
}) => {
  const { status: paymentStatus, message: statusMessage, updateStatus } = usePaymentStatus();
  const stripe = useStripe();
  const elements = useElements();
  
  const [formData, setFormData] = React.useState<CheckoutFormData>({
    email: initialData.email || "",
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    address: initialData.address || "",
    city: initialData.city || "",
    state: initialData.state || "",
    zipCode: initialData.zipCode || "",
    phone: initialData.phone || "",
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
    if (!fieldSchema) return true;

    const result = v.safeParse(fieldSchema, value);
    const error = result.success ? undefined : result.issues[0]?.message;
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return result.success;
  };

  const validateForm = () => {
    const result = v.safeParse(checkoutFormSchema, formData);
    
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
        orderId,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
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
            card: cardElement,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              address: {
                line1: formData.address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
              },
              phone: formData.phone,
            },
          },
        }
      );

      if (stripeError) {
        updateStatus('failed', stripeError.message || 'Payment failed');
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
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
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Payment Status */}
      <PaymentStatus status={paymentStatus} message={statusMessage} />

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
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              onBlur={handleInputBlur("email")}
              disabled={isSubmitting}
              className={getFieldError("email") ? "border-destructive" : ""}
              placeholder="your@email.com"
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
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                onBlur={handleInputBlur("firstName")}
                disabled={isSubmitting}
                className={getFieldError("firstName") ? "border-destructive" : ""}
                placeholder="John"
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
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                onBlur={handleInputBlur("lastName")}
                disabled={isSubmitting}
                className={getFieldError("lastName") ? "border-destructive" : ""}
                placeholder="Doe"
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
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              onBlur={handleInputBlur("phone")}
              disabled={isSubmitting}
              className={getFieldError("phone") ? "border-destructive" : ""}
              placeholder="(555) 123-4567"
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
              id="address"
              type="text"
              value={formData.address}
              onChange={handleInputChange("address")}
              onBlur={handleInputBlur("address")}
              disabled={isSubmitting}
              className={getFieldError("address") ? "border-destructive" : ""}
              placeholder="123 Main St"
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
                id="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange("city")}
                onBlur={handleInputBlur("city")}
                disabled={isSubmitting}
                className={getFieldError("city") ? "border-destructive" : ""}
                placeholder="New York"
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
                id="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange("state")}
                onBlur={handleInputBlur("state")}
                disabled={isSubmitting}
                className={getFieldError("state") ? "border-destructive" : ""}
                placeholder="NY"
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
              id="zipCode"
              type="text"
              value={formData.zipCode}
              onChange={handleInputChange("zipCode")}
              onBlur={handleInputBlur("zipCode")}
              disabled={isSubmitting}
              className={getFieldError("zipCode") ? "border-destructive" : ""}
              placeholder="10001"
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
                options={cardElementOptions}
                onChange={handleCardChange}
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
          type="submit"
          disabled={isSubmitting || !stripe || !cardComplete}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
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

// Main component that wraps with Stripe Elements provider
export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutFormInner {...props} />
    </Elements>
  );
};

export type { StripeCheckoutFormProps, CheckoutFormData };