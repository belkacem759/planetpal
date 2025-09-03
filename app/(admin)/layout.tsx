import { WithServerAuth } from '@/providers/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WithServerAuth>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Admin Area</h1>
        <hr className="mb-6" />
        {children}
      </div>
    </WithServerAuth>
  );
}