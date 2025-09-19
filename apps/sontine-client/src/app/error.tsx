'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center px-4 text-center">
        <div>
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            We couldn&apos;t load this page. You can try again or head back to the dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00B49F] px-5 py-2.5 text-white shadow hover:bg-[#00A08A] transition"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-100 transition"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
