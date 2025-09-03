/**
 * Admin Route: Admin users only
 * Order management
 */

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      <p className="mb-4">Order management functionality will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/admin" className="text-blue-600 hover:underline">
              Back to Admin Dashboard
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}