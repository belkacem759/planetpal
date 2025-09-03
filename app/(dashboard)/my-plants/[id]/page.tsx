/**
 * Protected Route: Authenticated users only
 * Plant details: nickname, type, photo, care, care logs
 */

export default function PlantDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Plant Details: {id}</h1>
      <p className="mb-4">Plant nickname, type, photo, care instructions, and care logs will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/my-plants" className="text-blue-600 hover:underline">
              Back to My Plants
            </a>
          </li>
          <li>
            <a href="/reminders" className="text-blue-600 hover:underline">
              View Reminders
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}