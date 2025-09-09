'use client';

import * as React from 'react';
import { CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed' | 'requires_action';

interface PaymentStatusProps {
  status: PaymentStatus;
  message?: string;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: CreditCard,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    message: 'Ready to process payment'
  },
  processing: {
    icon: Spinner,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    message: 'Processing your payment...'
  },
  succeeded: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    message: 'Payment successful!'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    message: 'Payment failed. Please try again.'
  },
  requires_action: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    message: 'Additional authentication required'
  }
};

export function PaymentStatus({ status, message, className }: PaymentStatusProps) {
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
    status,
    message,
    updateStatus,
    reset
  };
}