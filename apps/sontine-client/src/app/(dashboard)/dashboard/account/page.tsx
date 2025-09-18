'use client';

import React, { useState } from 'react';
import { Wallet, Send, Download, Zap, Copy, ExternalLink, RefreshCw, DollarSign } from 'lucide-react';

// Mock wallet data
const mockWalletData = {
  publicKey: 'CKaKwfq1BjKHMHZmzmeZQoWbNFjbyCgHMLunajcm5DEL',
  balance: 1250.75, // USDC
  solBalance: 0.5, // SOL
  connected: true,
};

const mockTransactions = [
  {
    id: '1',
    type: 'send',
    amount: 100,
    timestamp: '2024-01-15T10:30:00Z',
    to: 'ABC...XYZ',
    status: 'confirmed',
  },
  {
    id: '2',
    type: 'receive',
    amount: 250,
    timestamp: '2024-01-14T15:45:00Z',
    from: 'DEF...123',
    status: 'confirmed',
  },
  {
    id: '3',
    type: 'tontine_contribution',
    amount: 50,
    timestamp: '2024-01-13T09:15:00Z',
    to: 'Tontine #1001',
    status: 'confirmed',
  },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settings'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const walletData = mockWalletData;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.publicKey);
    // In a real app, you'd show a toast notification here
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

  if (!walletData.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <Wallet className="h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Connect Your Wallet</h2>
        <p className="text-gray-600 text-center max-w-md">
          Connect your Solana wallet to view your account balance, transaction history, and manage your funds.
        </p>
        <button className="bg-[#00B49F] text-white px-6 py-3 rounded-lg hover:bg-[#00A08A] transition-colors">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account</h1>
          <p className="text-gray-600 mt-1">Manage your wallet and view transaction history</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Wallet Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Wallet Overview</h2>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Connected</span>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Wallet Address</div>
              <div className="font-mono text-sm text-gray-900">
                {walletData.publicKey.slice(0, 8)}...{walletData.publicKey.slice(-8)}
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
            <div className="text-3xl font-bold">${walletData.balance.toFixed(2)}</div>
            <div className="text-sm opacity-90">USDC Balance</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <div className="text-3xl font-bold">{walletData.solBalance.toFixed(3)}</div>
            <div className="text-sm opacity-90">SOL Balance</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/dashboard/account/send"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Send className="h-6 w-6 text-[#00B49F] mb-2" />
            <span className="text-sm font-medium text-gray-900">Send</span>
          </a>
          <a
            href="/dashboard/account/receive"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-6 w-6 text-[#00B49F] mb-2" />
            <span className="text-sm font-medium text-gray-900">Receive</span>
          </a>
          <a
            href="/dashboard/account/airdrop"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Zap className="h-6 w-6 text-[#00B49F] mb-2" />
            <span className="text-sm font-medium text-gray-900">Airdrop</span>
          </a>
          <a
            href="/dashboard/tontines"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="h-6 w-6 text-[#00B49F] mb-2" />
            <span className="text-sm font-medium text-gray-900">Tontines</span>
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{mockTransactions.length}</div>
                  <div className="text-sm text-gray-600">Total Transactions</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${mockTransactions
                      .filter((t) => t.type === 'receive')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Received</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ${mockTransactions
                      .filter((t) => t.type === 'send')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Sent</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <div className="space-y-3">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="font-medium text-gray-900">{formatTransactionType(transaction.type)}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.type === 'receive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'receive' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">{transaction.status}</div>
                    </div>
                  </div>
                ))}
              </div>
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