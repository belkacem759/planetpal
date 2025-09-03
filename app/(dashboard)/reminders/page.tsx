/**
 * Protected Route: Authenticated users only
 * Upcoming/overdue plant care reminders, mark as complete
 */

export default function RemindersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reminders</h1>
      <p className="mb-4">Upcoming and overdue plant care reminders will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Back to Dashboard
            </a>
          </li>
          <li>
            <a href="/my-plants" className="text-blue-600 hover:underline">
              My Plants
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}