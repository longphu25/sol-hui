'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useWebWallet, Account } from '@/components/solana/use-web-wallet';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  account: Account | null;
  signIn: () => Promise<Account>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

function useSignInMutation() {
  const { signIn } = useWebWallet();

  return useMutation({
    mutationFn: async () => await signIn(),
  });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { account, connected, connecting, disconnecting, signOut } = useWebWallet();
  const signInMutation = useSignInMutation();

  const value: AuthState = useMemo(
    () => ({
      signIn: async () => await signInMutation.mutateAsync(),
      signOut: async () => await signOut(),
      isAuthenticated: connected && account !== null,
      isLoading: signInMutation.isPending || connecting || disconnecting,
      account,
    }),
    [account, connected, connecting, disconnecting, signOut, signInMutation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}