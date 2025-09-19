'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useWallet as useAdapterWallet } from '@solana/wallet-adapter-react';
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
  const { autoConnect, wallet } = useAdapterWallet();
  const signInMutation = useSignInMutation();

  const [autoConnectPending, setAutoConnectPending] = useState<boolean>(
    () => autoConnect && Boolean(wallet) && !connected
  );

  useEffect(() => {
    if (!autoConnect || !wallet) {
      setAutoConnectPending(false);
      return;
    }

    if (connected) {
      setAutoConnectPending(false);
      return;
    }

    if (connecting) {
      setAutoConnectPending(true);
      return;
    }

    setAutoConnectPending(true);
    const timeout = setTimeout(() => {
      setAutoConnectPending(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [autoConnect, wallet, connected, connecting]);

  const authenticatedAccount = account ?? signInMutation.data ?? null;

  const value: AuthState = useMemo(
    () => ({
      signIn: async () => await signInMutation.mutateAsync(),
      signOut: async () => await signOut(),
      isAuthenticated: connected || Boolean(authenticatedAccount),
      isLoading: signInMutation.isPending || connecting || disconnecting || autoConnectPending,
      account: authenticatedAccount,
    }),
    [
      authenticatedAccount,
      connected,
      connecting,
      disconnecting,
      signOut,
      signInMutation,
      autoConnectPending,
    ]
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
