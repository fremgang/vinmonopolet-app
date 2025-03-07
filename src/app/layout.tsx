import { ThemeProvider, ThemeToggle } from '@/components/ThemeProvider';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Wine, Info, Home, Mail } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vinmonopolet Explorer',
  description: 'Discover and explore Norways finest wines and spirits from Vinmonopolet.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <html lang="en" className="scroll-smooth">
        <body className="font-sans antialiased flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <header className="bg-black text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <Wine className="mr-3 text-accent" size={28} />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Vinmonopolet Explorer</h1>
                  <p className="text-xs text-gray-400">Norways Finest Wine & Spirits</p>
                </div>
              </div>
              
              <nav className="flex items-center gap-4 sm:gap-6">
                <Link href="/" className="text-white hover:text-accent transition-colors flex items-center gap-1">
                  <Home size={16} />
                  <span className="text-sm">Home</span>
                </Link>
                
                <Link href="/about" className="text-white hover:text-accent transition-colors flex items-center gap-1">
                  <Info size={16} />
                  <span className="text-sm">About</span>
                </Link>
                
                <Link href="/contact" className="text-white hover:text-accent transition-colors flex items-center gap-1">
                  <Mail size={16} />
                  <span className="text-sm">Contact</span>
                </Link>
                
                <ThemeToggle />
              </nav>
            </div>
          </header>
          
          <main className="flex-1 py-8 sm:py-12">{children}</main>
          
          <footer className="bg-gray-900 text-gray-300 py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-3">Vinmonopolet Explorer</h3>
                  <p className="text-sm">
                    A web application to discover and explore Norways finest wines and spirits.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-white text-md font-semibold mb-3">Quick Links</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    </li>
                    <li>
                      <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    </li>
                    <li>
                      <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white text-md font-semibold mb-3">Legal</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    </li>
                    <li>
                      <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Vinmonopolet Explorer. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ThemeProvider>
  );
}