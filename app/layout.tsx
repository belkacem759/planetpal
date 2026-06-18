import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { TransitionProgress } from '@/components/ui/transition-progress';

import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  description:
    'Discover, care for, and grow your plant collection with PlanetPal',
  metadataBase: new URL(defaultUrl),
  title: 'PlanetPal - Your Plant Care Companion',
};

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <TransitionProgress />
        <NuqsAdapter>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
            >
              {children}
            </ThemeProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
