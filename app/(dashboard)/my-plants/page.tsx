/**
 * Protected Route: Authenticated users only
 * Tracked plant list (purchased or added), add new plant button
 */

import Link from 'next/link';

export default function MyPlantsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Plants</h1>
      <p className="mb-4">Tracked plant list and add new plant functionality will be implemented here.</p>

      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <Link className="text-blue-600 hover:underline" href="/dashboard">
              Back to Dashboard
            </Link>
          </li>
          <li>
            <Link className="text-blue-600 hover:underline" href="/my-plants/example-id">
              View Sample Plant
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}