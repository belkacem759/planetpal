/**
 * Public Route: Accessible to all users
 * Dynamic blog post page
 */

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog Post: {slug}</h1>
      <p className="mb-4">Blog post content will be implemented here.</p>
      
      {/* Navigation links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/blog" className="text-blue-600 hover:underline">
              Back to Blog
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}