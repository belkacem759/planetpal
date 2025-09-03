/**
 * Admin Route: Admin users only (optional)
 * Site analytics
 */

export default function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Site Analytics</h1>
      <p className="mb-4">Site analytics functionality will be implemented here.</p>
      
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