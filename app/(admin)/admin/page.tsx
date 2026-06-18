import { createClient } from '@/lib/supabase/client';

export default async function AdminPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  // Ensure data is available before rendering
  if (!data) {
    return null;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          This is an admin-only page that requires the admin role
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Admin Dashboard</h2>
        <p>Welcome, admin user!</p>

        <div className="mt-4">
          <h3 className="font-bold text-xl mb-2">Your user details</h3>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(data.claims, null, 2)}
          </pre>
        </div>

        {/* Navigation links */}
        <div className="mt-8">
          <h3 className="font-bold text-xl mb-2">Admin Management</h3>
          <ul className="list-disc pl-5">
            <li>
              <a className="text-blue-600 hover:underline" href="/admin/users">
                User Management
              </a>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/admin/products">
                Product Management
              </a>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/admin/orders">
                Order Management
              </a>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/admin/categories">
                Category Management
              </a>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/admin/analytics">
                Site Analytics
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}