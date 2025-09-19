'use client';

import React from 'react';
import { AppProviders } from '@/components/app-providers';
import { AuthGuard } from '@/components/auth/auth-guard';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AppProviders>
      <AuthGuard>{children}</AuthGuard>
    </AppProviders>
  );
}
