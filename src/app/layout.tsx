import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vinmonopolet Explorer',
  description: 'Discover and explore Norway\'s finest wines and spirits from Vinmonopolet.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <ThemeProvider>
          <Header />
          
          <main className="flex-1 pt-32 pb-12">
            {children}
          </main>
          
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
                      <Link href="/" passHref>
                        <a className="hover:text-white transition-colors">Home</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" passHref>
                        <a className="hover:text-white transition-colors">About</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" passHref>
                        <a className="hover:text-white transition-colors">Contact</a>
                      </Link>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white text-md font-semibold mb-3">Legal</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/privacy" passHref>
                        <a className="hover:text-white transition-colors">Privacy Policy</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" passHref>
                        <a className="hover:text-white transition-colors">Terms of Service</a>
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
        </ThemeProvider>
      </body>
    </html>
  );
}