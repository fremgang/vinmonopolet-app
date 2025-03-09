'use client';

import Header from '@/components/Header';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import { ProductStreamProvider } from '@/components/ProductStreamProvider';
import LiveUpdates from '@/components/LiveUpdates';
import Footer from '@/components/Footer';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { usePathname } from 'next/navigation';

import './globals.css';

const prisma = new PrismaClient().$extends(withAccelerate());

export { prisma };

// Font configuration using Next.js 13+ font optimization
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="en" className={`scroll-smooth ${montserrat.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        
        {/* Wrap content with ProductStreamProvider for real-time updates */}
        <ProductStreamProvider>
          <main className="flex-1 pt-32 pb-12">
            <div className="max-w-7xl mx-auto px-4">
              {/* Main content */}
              {children}
              
              {/* Live updates section - shows recent product changes */}
              <LiveUpdates />
            </div>
          </main>
          
          {/* Conditional Footer - only show on non-home pages */}
          {!isHomePage && <Footer />}
        </ProductStreamProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}