import { ReactNode } from 'react';
import { MainLayout } from '@/components/layouts/main-layout';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}