import { ReactNode } from 'react';
import { WithServerAuth } from '@/providers/auth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <WithServerAuth>
      <div className="flex-1 w-full flex flex-col gap-6 px-8 py-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <hr className="border-t border-gray-200 dark:border-gray-800" />
        {children}
      </div>
    </WithServerAuth>
  );
}