import Link from 'next/link';
import { Home, Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <Frown size={80} className="mx-auto text-gray-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Looks like you&apos;ve wandered off the stag do route. Let&apos;s get you back to the party!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Home size={20} />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
