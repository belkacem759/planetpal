import { ReactNode, unstable_ViewTransition as ViewTransition } from 'react';

import { MainLayout } from '@/components/layouts/main-layout';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      <ViewTransition>{children}</ViewTransition>
    </MainLayout>
  );
}
