import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Vinmonopolet App',
  description: 'Explore Vinmonopolet products',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="p-4 bg-blue-600 text-white flex items-center">
          <img src="/next.svg" alt="Next.js Logo" className="h-8 mr-4" />
          <h1 className="text-2xl font-bold">Vinmonopolet</h1>
        </header>
        {children}
      </body>
    </html>
  );
}
