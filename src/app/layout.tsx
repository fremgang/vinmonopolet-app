import Link from 'next/link';
import type { Metadata } from 'next';
import { GeistProvider, CssBaseline } from '@geist-ui/core';
import './globals.css';
import ThemeToggle from './ThemeToggle';

export const metadata: Metadata = {
  title: 'Vinmonopolet Explorer',
  description: 'Discover and explore Norway’s finest wines and spirits from Vinmonopolet.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <GeistProvider>
      <CssBaseline />
      <html lang="en">
        <body className="font-sans antialiased flex flex-col min-h-screen">
          <header style={{ backgroundColor: '#000', color: '#fff', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Vinmonopolet Explorer</h1>
                <p style={{ fontSize: '0.875rem', color: '#999', margin: '4px 0 0' }}>Norway’s Finest Wine & Spirits</p>
              </div>
              <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Link href="/" passHref>
                  <a style={{ color: '#fff', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ccc')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                  >
                    Home
                  </a>
                </Link>
                <Link href="/about" passHref>
                  <a style={{ color: '#fff', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ccc')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                  >
                    About
                  </a>
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="flex-1 py-12">{children}</main>
          <footer className="bg-gray-900 text-white p-6 text-center">
            <p className="text-sm text-gray-300">© 2025 Vinmonopolet Explorer. All rights reserved.</p>
          </footer>
        </body>
      </html>
    </GeistProvider>
  );
}