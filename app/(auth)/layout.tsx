import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-center mt-8">Authentication</h1>
      <hr className="border-t border-gray-200 dark:border-gray-800" />
      {children}
    </div>
  );
}