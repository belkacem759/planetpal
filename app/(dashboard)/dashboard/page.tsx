/**
 * Protected Route: Authenticated users only
 * User plant stats, reminders, quick links
 */

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">User plant stats, reminders, and quick links will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <Link className="text-blue-600 hover:underline" href="/my-plants">
              My Plants
            </Link>
          </li>
          <li>
            <Link className="text-blue-600 hover:underline" href="/reminders">
              Reminders
            </Link>
          </li>
          <li>
            <Link className="text-blue-600 hover:underline" href="/profile">
              Profile
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}