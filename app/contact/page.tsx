/**
 * Public Route: Accessible to all users
 * Contact form and information
 */

export default function ContactPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-4">Contact form and information will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/about" className="text-blue-600 hover:underline">
              About Us
            </a>
          </li>
          <li>
            <a href="/shop" className="text-blue-600 hover:underline">
              Visit Our Shop
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}