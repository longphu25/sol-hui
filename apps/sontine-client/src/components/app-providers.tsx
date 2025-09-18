'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth/auth-provider';
import { ClusterProvider } from './cluster/cluster-provider';
import { SolanaProvider } from './solana/solana-provider';
import { WalletProvider } from './wallet/wallet-provider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ClusterProvider>
          <SolanaProvider>
            <WalletProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </WalletProvider>
          </SolanaProvider>
        </ClusterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}