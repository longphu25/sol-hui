'use client';

import React from 'react';
import { useAuth } from './auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname?.startsWith('/auth') || false;
      
      if (!isAuthenticated && !isAuthPage) {
        router.push('/auth/sign-in');
      } else if (isAuthenticated && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#00B49F] to-[#00A08A]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-white mx-auto mb-4"><p className="text-white text-base font-medium">Connecting to Solana...</p></div>
            
        </div>
      </div>
    );
  }

  return <>{children}</>;
}