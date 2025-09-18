'use client';

import React, { useState } from 'react';
import { Trophy, DollarSign, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { AppText } from '@/components/ui/app-text';
import { SontineCard, SontineCardContent } from '@/components/ui/sontine-card';
import { SontineButton } from '@/components/ui/sontine-button';

// Mock transaction history
const mockTransactions = [
  {
    id: '1',
    type: 'payout',
    amount: 450,
    description: 'Payout from Friends Circle',
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: '2',
    type: 'contribution',
    amount: 15,
    description: 'Contribution to Family Savings Group',
    date: '2024-01-10',
    status: 'completed',
  },
  {
    id: '3',
    type: 'contribution',
    amount: 25,
    description: 'Contribution to Investment Club',
    date: '2024-01-05',
    status: 'completed',
  },
  {
    id: '4',
    type: 'bid',
    amount: 0,
    description: 'Bid submitted for Crypto Enthusiasts',
    date: '2024-01-01',
    status: 'completed',
  },
  {
    id: '5',
    type: 'join',
    amount: 0,
    description: 'Joined Startup Founders Circle',
    date: '2023-12-28',
    status: 'pending',
  },
];

type FilterType = 'all' | 'contributions' | 'payouts' | 'bids';

export default function TransactionHistoryPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filters = [
    { key: 'all' as const, label: 'All' },
    { key: 'contributions' as const, label: 'Contributions' },
    { key: 'payouts' as const, label: 'Payouts' },
    { key: 'bids' as const, label: 'Bids' },
  ];

  const filteredTransactions = mockTransactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'contributions') return tx.type === 'contribution';
    if (filter === 'payouts') return tx.type === 'payout';
    if (filter === 'bids') return tx.type === 'bid';
    return true;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payout':
        return Trophy;
      case 'contribution':
        return DollarSign;
      case 'bid':
        return TrendingUp;
      case 'join':
        return Users;
      default:
        return CheckCircle;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payout':
        return '#10B981';
      case 'contribution':
        return '#DC2626';
      case 'bid':
        return '#8B5CF6';
      case 'join':
        return '#00B49F';
      default:
        return '#00B49F';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <AppText variant="displaySmall" className="text-gray-900 mb-2">
            Transaction History
          </AppText>
          <AppText variant="bodyLarge" className="text-gray-600">
            Track all your tontine activities and transactions
          </AppText>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white rounded-lg border border-gray-200">
          {filters.map((filterItem) => (
            <SontineButton
              key={filterItem.key}
              variant={filter === filterItem.key ? 'primary' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setFilter(filterItem.key)}
            >
              {filterItem.label}
            </SontineButton>
          ))}
        </div>

        {/* Transaction Count */}
        <AppText variant="titleMedium" className="text-gray-900 mb-4 font-medium">
          Transactions ({filteredTransactions.length})
        </AppText>

        {/* Transaction List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const IconComponent = getTransactionIcon(transaction.type);
            const iconColor = getTransactionColor(transaction.type);

            return (
              <SontineCard key={transaction.id} variant="default" padding="md">
                <SontineCardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mr-4"
                        style={{ backgroundColor: `${iconColor}20` }}
                      >
                        <IconComponent size={20} color={iconColor} />
                      </div>

                      <div className="flex-1">
                        <AppText variant="titleSmall" className="text-gray-900 mb-1 capitalize">
                          {transaction.type}
                        </AppText>
                        <AppText variant="bodyMedium" className="text-gray-700 mb-1">
                          {transaction.description}
                        </AppText>
                        <AppText variant="bodySmall" className="text-gray-500">
                          {transaction.date}
                        </AppText>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      {transaction.amount > 0 && (
                        <AppText
                          variant="titleSmall"
                          className={`mb-2 font-medium ${
                            transaction.type === 'payout' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'payout' ? '+' : '-'}
                          {transaction.amount} SOL
                        </AppText>
                      )}
                      <div
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                </SontineCardContent>
              </SontineCard>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <AppText variant="titleMedium" className="text-gray-500 mb-2">
              No transactions found
            </AppText>
            <AppText variant="bodyMedium" className="text-gray-400">
              Try adjusting your filter or make your first transaction
            </AppText>
          </div>
        )}
      </div>
    </div>
  );
}