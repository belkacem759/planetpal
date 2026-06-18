'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = {
    appearance: {
      theme: 'stripe' as const,
      variables: {
        borderRadius: '6px',
        colorBackground: '#ffffff',
        colorDanger: '#df1b41',
        colorPrimary: '#0570de',
        colorText: '#30313d',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
      },
    },
    clientSecret,
  };

  return (
    <Elements options={clientSecret ? options : undefined} stripe={stripePromise}>
      {children}
    </Elements>
  );
}