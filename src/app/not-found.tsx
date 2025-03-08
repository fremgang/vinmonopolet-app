import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-wine-800 mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-3 bg-wine-800 text-white rounded-md hover:bg-wine-700 transition-colors">
        Return to Home
      </Link>
    </div>
  );
}