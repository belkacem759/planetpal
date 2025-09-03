/**
 * Protected Route: Authenticated users only
 * User plant stats, reminders, quick links
 */

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
            <a href="/my-plants" className="text-blue-600 hover:underline">
              My Plants
            </a>
          </li>
          <li>
            <a href="/reminders" className="text-blue-600 hover:underline">
              Reminders
            </a>
          </li>
          <li>
            <a href="/profile" className="text-blue-600 hover:underline">
              Profile
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}