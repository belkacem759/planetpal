'use client';

import * as React from 'react';
import { CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed' | 'requires_action';

interface PaymentStatusProps {
  className?: string;
  message?: string;
  status: PaymentStatus;
}

const statusConfig = {
  failed: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    color: 'text-red-600',
    icon: XCircle,
    message: 'Payment failed. Please try again.'
  },
  idle: {
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    color: 'text-gray-500',
    icon: CreditCard,
    message: 'Ready to process payment'
  },
  processing: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    color: 'text-blue-600',
    icon: Spinner,
    message: 'Processing your payment...'
  },
  requires_action: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    color: 'text-yellow-600',
    icon: Clock,
    message: 'Additional authentication required'
  },
  succeeded: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    color: 'text-green-600',
    icon: CheckCircle,
    message: 'Payment successful!'
  }
};

export function PaymentStatus({ className, message, status }: PaymentStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayMessage = message || config.message;

  if (status === 'idle') {
    return null;
  }

  return (
    <Alert className={cn(
      'flex items-center space-x-3 p-4',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <Icon className={cn('h-5 w-5', config.color)} />
      <AlertDescription className={cn('font-medium', config.color)}>
        {displayMessage}
      </AlertDescription>
    </Alert>
  );
}

// Hook for managing payment status
export function usePaymentStatus() {
  const [status, setStatus] = React.useState<PaymentStatus>('idle');
  const [message, setMessage] = React.useState<string>('');

  const updateStatus = React.useCallback((newStatus: PaymentStatus, newMessage?: string) => {
    setStatus(newStatus);
    if (newMessage !== undefined) {
      setMessage(newMessage);
    }
  }, []);

  const reset = React.useCallback(() => {
    setStatus('idle');
    setMessage('');
  }, []);

  return {
    message,
    reset,
    status,
    updateStatus
  };
}