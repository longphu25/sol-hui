'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
