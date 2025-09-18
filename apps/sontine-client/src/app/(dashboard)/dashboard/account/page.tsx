'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Wallet, Send, Download, Zap, Copy, ExternalLink, RefreshCw, DollarSign } from 'lucide-react';
import { useWebWallet } from '@/components/solana/use-web-wallet';
import { useWalletData } from '@/components/wallet/wallet-provider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settings'>('overview');
  
  // Get wallet data and functions
  const { account } = useWebWallet();
  const {
    balance,
    isLoadingBalance,
    balanceError,
    transactions,
    isLoadingTransactions,
    transactionsError,
    summary,
    isLoadingSummary,
    summaryError,
    refreshAll,
  } = useWalletData();

  const handleRefresh = () => {
    refreshAll();
  };

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      // In a real app, you'd show a toast notification here
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <Send className="h-4 w-4 text-red-500" />;
      case 'receive':
        return <Download className="h-4 w-4 text-green-500" />;
      case 'tontine_contribution':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <ExternalLink className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'send':
        return 'Sent';
      case 'receive':
        return 'Received';
      case 'tontine_contribution':
        return 'Tontine Contribution';
      default:
        return type;
    }
  };

  if (!account?.publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <Wallet className="h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Connect Your Wallet</h2>
        <p className="text-gray-600 text-center max-w-md">
          Connect your Solana wallet to view your account balance, transaction history, and manage your funds.
        </p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account</h1>
          <p className="text-lg text-gray-600">Manage your wallet and view transaction history</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoadingBalance || isLoadingTransactions || isLoadingSummary}
          className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 bg-white/70 backdrop-blur-sm"
        >
          <RefreshCw className={`h-4 w-4 ${(isLoadingBalance || isLoadingTransactions || isLoadingSummary) ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Wallet Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Wallet Overview</h2>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Connected</span>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Wallet Address</div>
              <div className="font-mono text-sm text-gray-900">
                {account.displayAddress}
              </div>
            </div>
            <button
              onClick={copyAddress}
              className="flex items-center space-x-1 text-[#00B49F] hover:text-[#00A08A] transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">Copy</span>
            </button>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-[#00B49F] to-[#00A08A] rounded-lg text-white">
            {isLoadingBalance ? (
              <div className="text-3xl font-bold">Loading...</div>
            ) : balanceError ? (
              <div className="text-3xl font-bold text-red-200">Error</div>
            ) : (
              <div className="text-3xl font-bold">${(balance?.usdc || 0).toFixed(2)}</div>
            )}
            <div className="text-sm opacity-90">USDC Balance</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            {isLoadingBalance ? (
              <div className="text-3xl font-bold">Loading...</div>
            ) : balanceError ? (
              <div className="text-3xl font-bold text-red-200">Error</div>
            ) : (
              <div className="text-3xl font-bold">{(balance?.sol || 0).toFixed(3)}</div>
            )}
            <div className="text-sm opacity-90">SOL Balance</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/account/send"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-[#00B49F]/10 hover:to-[#00A08A]/10 hover:border-[#00B49F]/30 transition-all duration-200 group"
          >
            <Send className="h-8 w-8 text-[#00B49F] mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Send</span>
          </Link>
          <Link
            href="/dashboard/account/receive"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-[#00B49F]/10 hover:to-[#00A08A]/10 hover:border-[#00B49F]/30 transition-all duration-200 group"
          >
            <Download className="h-8 w-8 text-[#00B49F] mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Receive</span>
          </Link>
          <Link
            href="/dashboard/account/airdrop"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-[#00B49F]/10 hover:to-[#00A08A]/10 hover:border-[#00B49F]/30 transition-all duration-200 group"
          >
            <Zap className="h-8 w-8 text-[#00B49F] mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Airdrop</span>
          </Link>
          <Link
            href="/dashboard/tontines"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-[#00B49F]/10 hover:to-[#00A08A]/10 hover:border-[#00B49F]/30 transition-all duration-200 group"
          >
            <DollarSign className="h-8 w-8 text-[#00B49F] mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Tontines</span>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="flex border-b border-gray-200/50">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'transactions', label: 'Transactions' },
            { key: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#00B49F] border-b-2 border-[#00B49F]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Summary</h3>
              {isLoadingSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : summaryError ? (
                <div className="text-red-600 p-4 border border-red-200 rounded-lg">
                  Error loading summary: {summaryError}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{summary?.totalTransactions || 0}</div>
                    <div className="text-sm text-gray-600">Total Transactions</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(summary?.totalReceived || 0).toFixed(3)} SOL
                    </div>
                    <div className="text-sm text-gray-600">Total Received</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {(summary?.totalSent || 0).toFixed(3)} SOL
                    </div>
                    <div className="text-sm text-gray-600">Total Sent</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              {isLoadingTransactions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactionsError ? (
                <div className="text-red-600 p-4 border border-red-200 rounded-lg">
                  Error loading transactions: {transactionsError}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.signature} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="font-medium text-gray-900">{formatTransactionType(transaction.type)}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </div>
                          {transaction.counterparty && (
                            <div className="text-xs text-gray-500 font-mono">
                              {transaction.counterparty.slice(0, 8)}...{transaction.counterparty.slice(-8)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.type === 'receive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'receive' ? '+' : '-'}{transaction.amount.toFixed(3)} SOL
                        </div>
                        <div className="text-sm text-gray-600 capitalize">{transaction.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Wallet Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Auto-refresh Balance</div>
                    <div className="text-sm text-gray-600">Automatically update balance every 30 seconds</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00B49F]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B49F]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Transaction Notifications</div>
                    <div className="text-sm text-gray-600">Get notified when transactions are confirmed</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00B49F]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B49F]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}