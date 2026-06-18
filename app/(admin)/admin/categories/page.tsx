/**
 * Admin Route: Admin users only
 * Category management
 */

export default function AdminCategoriesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>
      <p className="mb-4">Category management functionality will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a className="text-blue-600 hover:underline" href="/admin">
              Back to Admin Dashboard
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}