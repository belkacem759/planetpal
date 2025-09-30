import { MainLayout } from '@/components/layouts/main-layout';
import { ReactNode } from 'react';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}