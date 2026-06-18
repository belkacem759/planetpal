/**
 * Public Route: Accessible to all users
 * About/shop info page
 */

export default function AboutPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">About PlanetPal</h1>
      <p className="mb-4">Information about the shop and mission will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a className="text-blue-600 hover:underline" href="/shop">
              Visit Our Shop
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}