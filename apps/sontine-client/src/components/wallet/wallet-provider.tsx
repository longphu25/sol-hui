'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWebWallet } from '@/components/solana/use-web-wallet';
import { SolanaService, WalletBalance, RecentTransaction, TransactionSummary } from '@/lib/solana-service';
import { useCluster } from '@/components/cluster/cluster-provider';
import { ClusterNetwork } from '@/constants/app-config';

interface WalletContextType {
  // Balance state
  balance: WalletBalance | null;
  isLoadingBalance: boolean;
  balanceError: string | null;
  
  // Transaction state
  transactions: RecentTransaction[];
  isLoadingTransactions: boolean;
  transactionsError: string | null;
  
  // Summary state
  summary: TransactionSummary | null;
  isLoadingSummary: boolean;
  summaryError: string | null;
  
  // Airdrop state
  isRequestingAirdrop: boolean;
  airdropError: string | null;
  lastAirdropTx: string | null;
  
  // Actions
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  requestAirdrop: (amount?: number) => Promise<string>;
  refreshAll: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

function useOptionalConnection() {
  try {
    return useConnection();
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[WalletProvider] ConnectionProvider not found; skipping wallet context initialisation');
    }
    return null;
  }
}

export function WalletProvider({ children }: WalletProviderProps) {
  const connectionState = useOptionalConnection();
  const connection = connectionState?.connection ?? null;
  const { account, connected } = useWebWallet();
  const { selectedCluster } = useCluster();
  
  // State
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);
  const [airdropError, setAirdropError] = useState<string | null>(null);
  const [lastAirdropTx, setLastAirdropTx] = useState<string | null>(null);

  // Service instance
  const solanaService = useMemo(() => (connection ? new SolanaService(connection) : null), [connection]);
  const isMainnet = selectedCluster.network === ClusterNetwork.Mainnet;

  // Refresh functions
  const refreshBalance = useCallback(async () => {
    if (!account?.publicKey || !connected || !solanaService) {
      setBalance(null);
      setBalanceError(null);
      return;
    }

    setIsLoadingBalance(true);
    setBalanceError(null);
    
    try {
      const newBalance = await solanaService.getWalletBalance(account.publicKey, isMainnet);
      setBalance(newBalance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance';
      setBalanceError(errorMessage);
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [account?.publicKey, connected, solanaService, isMainnet]);

  const refreshTransactions = useCallback(async () => {
    if (!account?.publicKey || !connected || !solanaService) {
      setTransactions([]);
      setTransactionsError(null);
      return;
    }

    setIsLoadingTransactions(true);
    setTransactionsError(null);
    
    try {
      const newTransactions = await solanaService.getRecentTransactions(account.publicKey);
      setTransactions(newTransactions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
      setTransactionsError(errorMessage);
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [account?.publicKey, connected, solanaService]);

  const refreshSummary = useCallback(async () => {
    if (!account?.publicKey || !connected || !solanaService) {
      setSummary(null);
      setSummaryError(null);
      return;
    }

    setIsLoadingSummary(true);
    setSummaryError(null);
    
    try {
      const newSummary = await solanaService.getTransactionSummary(account.publicKey);
      setSummary(newSummary);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch summary';
      setSummaryError(errorMessage);
      console.error('Error fetching summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [account?.publicKey, connected, solanaService]);

  const requestAirdrop = useCallback(async (amount = 1): Promise<string> => {
    if (!account?.publicKey || !connected || !solanaService) {
      throw new Error('Wallet not connected');
    }

    if (isMainnet) {
      throw new Error('Airdrops are only available on devnet');
    }

    setIsRequestingAirdrop(true);
    setAirdropError(null);
    
    try {
      const signature = await solanaService.requestAirdrop(account.publicKey, amount);
      setLastAirdropTx(signature);
      
      // Refresh balance after successful airdrop with longer delay to avoid rate limiting
      setTimeout(() => {
        refreshBalance();
      }, 3000);
      
      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request airdrop';
      setAirdropError(errorMessage);
      throw error;
    } finally {
      setIsRequestingAirdrop(false);
    }
  }, [account?.publicKey, connected, isMainnet, solanaService, refreshBalance]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshBalance(),
      refreshTransactions(),
      refreshSummary(),
    ]);
  }, [refreshBalance, refreshTransactions, refreshSummary]);

  // Auto-refresh on wallet connection change
  useEffect(() => {
    if (connected && account?.publicKey) {
      // Debounce the refresh to avoid multiple calls
      const timeoutId = setTimeout(() => {
        refreshAll();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Clear state when disconnected
      setBalance(null);
      setTransactions([]);
      setSummary(null);
      setBalanceError(null);
      setTransactionsError(null);
      setSummaryError(null);
      setAirdropError(null);
      setLastAirdropTx(null);
    }
  }, [connected, account?.publicKey, refreshAll]);

  // Auto-refresh on cluster change (debounced)
  useEffect(() => {
    if (connected && account?.publicKey) {
      // Debounce cluster changes to avoid excessive refreshing
      const timeoutId = setTimeout(() => {
        refreshAll();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedCluster.id, connected, account?.publicKey, refreshAll]);

  const value: WalletContextType = {
    // Balance state
    balance,
    isLoadingBalance,
    balanceError,
    
    // Transaction state
    transactions,
    isLoadingTransactions,
    transactionsError,
    
    // Summary state
    summary,
    isLoadingSummary,
    summaryError,
    
    // Airdrop state
    isRequestingAirdrop,
    airdropError,
    lastAirdropTx,
    
    // Actions
    refreshBalance,
    refreshTransactions,
    refreshSummary,
    requestAirdrop,
    refreshAll,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletData() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletData must be used within a WalletProvider');
  }
  return context;
}
