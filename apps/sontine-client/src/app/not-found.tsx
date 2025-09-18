import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto w-24 h-24 bg-[#00B49F]/10 rounded-full flex items-center justify-center mb-6">
          <Home className="w-12 h-12 text-[#00B49F]" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 bg-[#00B49F] text-white px-6 py-3 rounded-lg hover:bg-[#00A08A] transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}