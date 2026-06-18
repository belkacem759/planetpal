import { ReactNode } from 'react';

import { MainLayout } from '@/components/layouts/main-layout';
import { ViewTransition } from '@/components/ui/view-transition';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      <ViewTransition>{children}</ViewTransition>
    </MainLayout>
  );
}
