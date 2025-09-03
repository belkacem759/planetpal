/**
 * Protected Route: Authenticated users only
 * Shipping address form, order summary, payment
 */

import { WithServerAuth } from '@/providers/auth';

export default function CheckoutPage() {
  return (
    <WithServerAuth>
      <div className="container mx-auto p-6">
        <p className="mb-4">Shipping address form, order summary, and payment functionality will be implemented here.</p>
        
        {/* Navigation links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Navigation</h2>
          <ul className="list-disc pl-5">
            <li>
              <a href="/cart" className="text-blue-600 hover:underline">
                Back to Cart
              </a>
            </li>
            <li>
              <a href="/order-success" className="text-blue-600 hover:underline">
                Simulate Order Success
              </a>
            </li>
          </ul>
        </div>
      </div>
    </WithServerAuth>
  );
}