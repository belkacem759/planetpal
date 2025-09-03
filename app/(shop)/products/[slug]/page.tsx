/**
 * Public Route: Accessible to all users
 * Dynamic product details page
 */

export default function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Product: {params.slug}</h1>
      <p className="mb-4">Dynamic product details will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/shop" className="text-blue-600 hover:underline">
              Back to Shop
            </a>
          </li>
          <li>
            <a href="/cart" className="text-blue-600 hover:underline">
              Add to Cart
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}