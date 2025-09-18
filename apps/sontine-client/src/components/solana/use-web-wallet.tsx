'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useMemo } from 'react';
import { AppConfig } from '@/constants/app-config';
import { ellipsify } from '@/utils/ellipsify';

export interface Account {
  address: string;
  displayAddress?: string;
  label?: string;
  publicKey: PublicKey;
}

export function useWebWallet() {
  const {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    connect,
    disconnect,
    signMessage,
    signTransaction,
    signAllTransactions,
  } = useWallet();

  const account = useMemo<Account | null>(() => {
    if (!publicKey || !connected) return null;

    return {
      address: publicKey.toBase58(),
      displayAddress: ellipsify(publicKey.toBase58(), 8),
      label: wallet?.adapter.name || ellipsify(publicKey.toBase58(), 8),
      publicKey,
    };
  }, [publicKey, connected, wallet?.adapter.name]);

  const signIn = useCallback(async (): Promise<Account> => {
    if (!connected || !publicKey) {
      await connect();
      if (!publicKey) {
        throw new Error('Failed to connect wallet');
      }
    }

    // Sign a message to authenticate (similar to mobile app's sign-in payload)
    if (signMessage) {
      const message = new TextEncoder().encode(
        `Sign in to ${AppConfig.appName}\n\nDomain: ${AppConfig.uri}\nTimestamp: ${Date.now()}`
      );
      await signMessage(message);
    }

    return {
      address: publicKey.toBase58(),
      displayAddress: ellipsify(publicKey.toBase58(), 8),
      label: wallet?.adapter.name || ellipsify(publicKey.toBase58(), 8),
      publicKey,
    };
  }, [connected, publicKey, connect, signMessage, wallet?.adapter.name]);

  const signOut = useCallback(async (): Promise<void> => {
    await disconnect();
  }, [disconnect]);

  return useMemo(
    () => ({
      account,
      connected,
      connecting,
      disconnecting,
      signIn,
      signOut,
      signMessage,
      signTransaction,
      signAllTransactions,
    }),
    [
      account,
      connected,
      connecting,
      disconnecting,
      signIn,
      signOut,
      signMessage,
      signTransaction,
      signAllTransactions,
    ]
  );
}