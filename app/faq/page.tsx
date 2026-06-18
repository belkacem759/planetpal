/**
 * Public Route: Accessible to all users
 * Frequently asked questions
 */

export default function FAQPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <p className="mb-4">FAQ content will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a className="text-blue-600 hover:underline" href="/contact">
              Contact Us
            </a>
          </li>
          <li>
            <a className="text-blue-600 hover:underline" href="/about">
              About Us
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}