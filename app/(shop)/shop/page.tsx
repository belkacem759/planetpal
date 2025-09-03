/**
 * Public Route: Accessible to all users
 * Product grid with filters and search
 */

export default function ShopPage() {
  return (
    <div className="container mx-auto p-6">
      <p className="mb-4">Product grid with filters and search will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/products/sample-product" className="text-blue-600 hover:underline">
              View Sample Product
            </a>
          </li>
          <li>
            <a href="/categories/sample-category" className="text-blue-600 hover:underline">
              View Sample Category
            </a>
          </li>
          <li>
            <a href="/cart" className="text-blue-600 hover:underline">
              View Cart
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}