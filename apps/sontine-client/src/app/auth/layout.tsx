import type { Metadata } from 'next';
import { AppProviders } from '@/components/app-providers';

export const metadata: Metadata = {
  title: 'Sign In | Sontine',
  description: 'Sign in to your Sontine account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-gradient-to-br from-[#00B49F] to-[#00A08A] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </AppProviders>
  );
}
