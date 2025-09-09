'use client';

import { LoginForm } from "@/components/login-form";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}