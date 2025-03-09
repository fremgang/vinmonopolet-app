import Link from 'next/link';
import Header from '@/components/Header';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import { ProductStreamProvider } from '@/components/ProductStreamProvider';
import LiveUpdates from '@/components/LiveUpdates';
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

export const metadata: Metadata = {
  title: 'Vinmonopolet Explorer',
  description: 'Discover and explore Norway\'s finest wines and spirits from Vinmonopolet.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${montserrat.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        
        {/* Wrap content with ProductStreamProvider for real-time updates */}
        <ProductStreamProvider>
          <main className="flex-1 pt-32 pb-12">
            <div className="max-w-7xl mx-auto px-4">
              {/* Live updates section - shows recent product changes */}
              <LiveUpdates />
              
              {/* Main content */}
              {children}
            </div>
          </main>
        </ProductStreamProvider>
        
        <footer className="bg-gray-900 text-gray-300 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-serif text-lg font-semibold mb-3">Vinmonopolet Explorer</h3>
                <p className="text-sm">
                  A web application to discover and explore Norways finest wines and spirits.
                </p>
              </div>
              
              <div>
                <h4 className="text-white text-md font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white text-md font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} Vinmonopolet Explorer. All rights reserved.</p>
            </div>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}