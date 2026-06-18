/**
 * Protected Route: Authenticated users only
 * Plant details: nickname, type, photo, care, care logs
 */

import Link from 'next/link';

export default async function PlantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Plant Details: {id}</h1>
      <p className="mb-4">Plant nickname, type, photo, care instructions, and care logs will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <Link className="text-blue-600 hover:underline" href="/my-plants">
              Back to My Plants
            </Link>
          </li>
          <li>
            <Link className="text-blue-600 hover:underline" href="/reminders">
              View Reminders
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}