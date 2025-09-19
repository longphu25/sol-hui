'use client';

import React from 'react';
import { useAuth } from './auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = useMemo(() => pathname?.startsWith('/auth') || false, [pathname]);
  const shouldRedirectToSignIn = !isLoading && !isAuthenticated && !isAuthPage;
  const shouldRedirectToDashboard = !isLoading && isAuthenticated && isAuthPage;

  useEffect(() => {
    if (shouldRedirectToSignIn) {
      router.replace('/auth/sign-in');
    }
  }, [router, shouldRedirectToSignIn]);

  useEffect(() => {
    if (shouldRedirectToDashboard) {
      router.replace('/dashboard');
    }
  }, [router, shouldRedirectToDashboard]);

  if (isLoading || shouldRedirectToSignIn || shouldRedirectToDashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#00B49F] to-[#00A08A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to Solana...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
