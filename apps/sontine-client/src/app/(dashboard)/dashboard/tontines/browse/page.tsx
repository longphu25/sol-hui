'use client';

import React, { useState, useMemo } from 'react';
import { Search, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';

// Helper types and interfaces (adapted from mobile version)
interface Tontine {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  contributionAmount: number;
  members: number;
  currentRound: number;
  totalRounds: number;
  nextContribution: string | null;
  status: 'active' | 'pending' | 'completed';
  myTurn: boolean;
  biddingOpen: boolean;
  gid: string;
}

// Helper types
interface GroupAccount {
  publicKey: { toString: () => string };
  account: {
    groupId: number;
    contributionAmount: number;
    maxMembers: number;
    currentMembers: number;
    currentRound: number;
    totalRounds: number;
    status: unknown;
    selectionMethod: unknown;
  };
}

// Helper function to convert Group account data to Tontine format
const convertGroupToTontine = (groupAccount: GroupAccount): Tontine => {
  const group = groupAccount.account;

  if (!group) {
    throw new Error('Invalid group account data');
  }

  // Convert status from GroupStatus enum to string
  const getStatusString = (status: unknown): 'active' | 'pending' | 'completed' => {
    if (typeof status === 'object' && status !== null) {
      const statusObj = status as Record<string, unknown>;
      if ('active' in statusObj) return 'active';
      if ('forming' in statusObj) return 'pending';
      if ('completed' in statusObj) return 'completed';
      if ('paused' in statusObj) return 'pending';
      if ('cancelled' in statusObj) return 'pending';
    }
    // Fallback based on numeric values
    switch (status) {
      case 0:
        return 'pending'; // Forming
      case 1:
        return 'active'; // Active
      case 2:
        return 'pending'; // Paused
      case 3:
        return 'completed'; // Completed
      case 4:
        return 'pending'; // Cancelled
      default:
        return 'pending';
    }
  };

  // Convert contribution amount from lamports to USDC
  const USDC_DECIMALS = 6;
  const contributionAmount = Number(group.contributionAmount || 0) / Math.pow(10, USDC_DECIMALS);

  // Calculate total amount (contribution * max members)
  const totalAmount = contributionAmount * (group.maxMembers || 0);

  // Generate a descriptive name based on group properties
  const getGroupName = (groupId: string, selectionMethod: unknown): string => {
    let methodName = 'Unknown';

    if (typeof selectionMethod === 'object' && selectionMethod !== null) {
      const methodObj = selectionMethod as Record<string, unknown>;
      if ('auction' in methodObj) methodName = 'Auction';
      else if ('random' in methodObj) methodName = 'Random';
      else if ('fixedOrder' in methodObj) methodName = 'Fixed Order';
      else methodName = Object.keys(methodObj)[0] || 'Unknown';
    } else if (typeof selectionMethod === 'number') {
      switch (selectionMethod) {
        case 0:
          methodName = 'Auction';
          break;
        case 1:
          methodName = 'Random';
          break;
        case 2:
          methodName = 'Fixed Order';
          break;
        default:
          methodName = 'Unknown';
      }
    }

    return `# ${groupId} (${methodName})`;
  };

  // Generate description based on group properties
  const getGroupDescription = (maxMembers: number, contributionAmount: number, currentMembers: number): string => {
    const memberText =
      currentMembers === maxMembers ? `${maxMembers} members` : `${currentMembers}/${maxMembers} members`;
    return `${memberText} • ${contributionAmount.toFixed(2)} USDC per round`;
  };

  return {
    id: groupAccount.publicKey.toString(),
    name: getGroupName(group.groupId.toString(), group.selectionMethod),
    description: getGroupDescription(group.maxMembers, contributionAmount, group.currentMembers),
    totalAmount,
    contributionAmount,
    members: group.currentMembers,
    currentRound: group.currentRound,
    totalRounds: group.totalRounds,
    nextContribution: null, // We don't have this data from the group account
    status: getStatusString(group.status),
    myTurn: false, // We don't have this data from the group account
    biddingOpen: 
      typeof group.selectionMethod === 'object' && 
      group.selectionMethod !== null && 
      'auction' in (group.selectionMethod as Record<string, unknown>) && 
      getStatusString(group.status) === 'active',
    gid: group.groupId.toString(),
  };
};

export default function BrowseTontinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'forming' | 'active' | 'completed' | 'paused' | 'cancelled'
  >('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration - in real app, this would come from blockchain
  const mockGroupAccounts = {
    data: [
      {
        publicKey: { toString: () => 'group1' },
        account: {
          groupId: 1001,
          contributionAmount: 100000000, // 100 USDC in lamports
          maxMembers: 10,
          currentMembers: 8,
          currentRound: 3,
          totalRounds: 10,
          status: { active: {} },
          selectionMethod: { auction: {} },
        },
      },
      {
        publicKey: { toString: () => 'group2' },
        account: {
          groupId: 1002,
          contributionAmount: 50000000, // 50 USDC in lamports
          maxMembers: 6,
          currentMembers: 4,
          currentRound: 1,
          totalRounds: 6,
          status: { forming: {} },
          selectionMethod: { random: {} },
        },
      },
    ],
    isLoading: false,
    error: null,
    isRefetching: false,
    refetch: () => setIsLoading(true),
  };

  const filters = [
    { key: 'all', label: 'All Groups', icon: '📋' },
    { key: 'forming', label: 'Forming', icon: '👥' },
    { key: 'active', label: 'Active', icon: '✅' },
    { key: 'completed', label: 'Completed', icon: '🏆' },
    { key: 'paused', label: 'Paused', icon: '⏸️' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' },
  ];

  // Convert group accounts to tontine format and apply filters
  const availableTontines = useMemo(() => {
    if (!mockGroupAccounts.data) return [];
    return mockGroupAccounts.data.map(convertGroupToTontine);
  }, [mockGroupAccounts.data]);

  const filteredTontines = useMemo(() => {
    return availableTontines.filter((tontine) => {
      const matchesSearch =
        tontine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tontine.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = selectedFilter === 'all' || tontine.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [availableTontines, searchQuery, selectedFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Tontines</h1>
          <p className="text-gray-600 mt-1">Discover and join tontine groups in your community</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tontine groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B49F] focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isSelected = selectedFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key as typeof selectedFilter)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#00B49F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedFilter === 'all'
              ? `All Tontines (${filteredTontines.length})`
              : `${filters.find((f) => f.key === selectedFilter)?.label} Groups (${filteredTontines.length})`}
          </h2>
        </div>

        {mockGroupAccounts.isLoading || isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[#00B49F] mb-4" />
            <p className="text-gray-600">Loading tontine groups...</p>
          </div>
        ) : mockGroupAccounts.error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error loading tontine groups</div>
            <p className="text-gray-600 text-sm">{mockGroupAccounts.error}</p>
          </div>
        ) : filteredTontines.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {availableTontines.length === 0
                ? 'No tontine groups available yet'
                : selectedFilter === 'all'
                ? 'No tontines match your search'
                : `No ${filters.find((f) => f.key === selectedFilter)?.label.toLowerCase()} groups found`}
            </h3>
            <p className="text-gray-600">
              {availableTontines.length === 0
                ? 'Create a new group or wait for others to create one'
                : selectedFilter === 'all'
                ? 'Try adjusting your search terms'
                : 'Try selecting a different status filter or search for specific groups'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTontines.map((tontine) => (
              <div key={tontine.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tontine.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{tontine.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tontine.status)}`}>
                    {tontine.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{tontine.members} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">${tontine.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Round {tontine.currentRound}/{tontine.totalRounds}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">${tontine.contributionAmount.toFixed(2)}/round</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Group ID: {tontine.gid}
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={`/dashboard/tontines/${tontine.id}`}
                      className="text-[#00B49F] hover:underline text-sm font-medium"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}