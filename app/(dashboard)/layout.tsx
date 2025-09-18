import { ReactNode } from 'react';
import { WithServerAuth } from '@/providers/auth/withServerAuth';
import { MainLayout } from '@/components/layouts/main-layout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <WithServerAuth>
      <MainLayout>
        {children}
      </MainLayout>
    </WithServerAuth>
  );
}