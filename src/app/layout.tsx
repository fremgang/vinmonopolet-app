// 4. Update src/app/layout.tsx to remove Vercel Analytics and Speed Insights
'use client';

import Header from '@/components/Header';
import { Montserrat, Playfair_Display } from 'next/font/google';
import { ProductStreamProvider } from '@/components/ProductStreamProvider';
import LiveUpdates from '@/components/LiveUpdates';
import { usePathname } from 'next/navigation';
import './globals.css';

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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>Vinmonoqolet Explorer</title>
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-cream dark:bg-gray-900 transition-colors duration-200">
        <Header />
        
        <ProductStreamProvider>
          <main className="flex-1 pt-24 pb-12">
            {children}
          </main>
          <LiveUpdates />
        </ProductStreamProvider>
      </body>
    </html>
  );
}