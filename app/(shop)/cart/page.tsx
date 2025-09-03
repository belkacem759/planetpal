/**
 * Protected Route: Authenticated users only
 * User's cart, quantity edit, remove/add, proceed to checkout
 */

import { WithServerAuth } from '@/providers/auth';

export default function CartPage() {
  return (
    <WithServerAuth>
      <div className="container mx-auto p-6">
        <p className="mb-4">Cart functionality will be implemented here.</p>
        
        {/* Navigation links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Navigation</h2>
          <ul className="list-disc pl-5">
            <li>
              <a href="/shop" className="text-blue-600 hover:underline">
                Continue Shopping
              </a>
            </li>
            <li>
              <a href="/checkout" className="text-blue-600 hover:underline">
                Proceed to Checkout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </WithServerAuth>
  );
}