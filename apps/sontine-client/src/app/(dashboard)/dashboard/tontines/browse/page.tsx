'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { CreateTontineModal } from '@/components/tontines/create-tontine-modal';
import { useLocalTontines, CreateTontineInput } from '@/hooks/use-local-tontines';
import { getMockRemoteTontines } from '@/utils/mock-tontines';

export default function BrowseTontinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'forming' | 'active' | 'completed' | 'paused' | 'cancelled' | 'pending'
  >('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { account } = useAuth();
  const walletAddress = account?.address;

  const { tontines: localTontines, addTontine, joinTontine, isMember } = useLocalTontines();

  const remoteTontines = useMemo(() => getMockRemoteTontines(), []);

  React.useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  // Mock data for demonstration - in real app, this would come from blockchain
  const handleCreateTontine = useCallback(
    (input: CreateTontineInput) => {
      const created = addTontine({ ...input, creatorAddress: walletAddress ?? null });
      setShowCreateModal(false);
      setFeedback({ type: 'success', text: `Created ${created.name}` });
    },
    [addTontine, walletAddress]
  );

  const handleJoinTontine = useCallback(
    (tontineId: string) => {
      const result = joinTontine(tontineId, walletAddress);

      if (result.success) {
        setFeedback({ type: 'success', text: 'Joined tontine successfully' });
        return;
      }

      switch (result.reason) {
        case 'WALLET_REQUIRED':
          setFeedback({ type: 'error', text: 'Connect your wallet to join this tontine.' });
          break;
        case 'ALREADY_JOINED':
          setFeedback({ type: 'error', text: 'You already joined this tontine.' });
          break;
        case 'GROUP_FULL':
          setFeedback({ type: 'error', text: 'This tontine is already full.' });
          break;
        default:
          setFeedback({ type: 'error', text: 'We could not find that tontine.' });
      }
    },
    [joinTontine, walletAddress]
  );

  const filters = [
    { key: 'all', label: 'All Groups', icon: '📋' },
    { key: 'forming', label: 'Forming', icon: '👥' },
    { key: 'pending', label: 'Pending', icon: '⌛' },
    { key: 'active', label: 'Active', icon: '✅' },
    { key: 'completed', label: 'Completed', icon: '🏆' },
    { key: 'paused', label: 'Paused', icon: '⏸️' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' },
  ];

  const availableTontines = useMemo(() => {
    return [...localTontines, ...remoteTontines];
  }, [localTontines, remoteTontines]);

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
      case 'forming':
        return 'bg-amber-100 text-amber-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Tontines</h1>
          <p className="text-lg text-gray-600">Discover and join tontine groups in your community</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#00B49F] to-[#00A08A] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
          >
            Create Group
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 bg-white/70 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tontine groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B49F] focus:border-transparent bg-white/70 text-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const isSelected = selectedFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key as typeof selectedFilter)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00B49F] to-[#00A08A] text-white shadow-md'
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[#00B49F] mb-4" />
            <p className="text-gray-600">Loading tontine groups...</p>
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
            {filteredTontines.map((tontine) => {
              const isLocal = tontine.source === 'local';
              const hasLocalMembers = isLocal && Array.isArray(tontine.memberAddresses);
              const currentMembers = hasLocalMembers ? tontine.memberAddresses!.length : tontine.members;
              const maxMembers =
                typeof tontine.maxMembers === 'number'
                  ? tontine.maxMembers
                  : hasLocalMembers
                  ? tontine.memberAddresses!.length
                  : undefined;
              const memberLabel = maxMembers ? `${currentMembers}/${maxMembers} members` : `${currentMembers} members`;
              const availableSpots = typeof maxMembers === 'number' ? Math.max(maxMembers - currentMembers, 0) : null;
              const userIsMember = isLocal ? isMember(tontine.id, walletAddress) : false;
              const isFull = Boolean(typeof maxMembers === 'number' && currentMembers >= maxMembers);
              const selectionLabel = (() => {
                const method = tontine.settings?.selectionMethod;
                if (!method) return null;
                switch (method) {
                  case 'random':
                    return 'Random';
                  case 'fixedOrder':
                    return 'Fixed order';
                  case 'auction':
                    return 'Auction';
                  default:
                    return null;
                }
              })();

              return (
                <div
                  key={tontine.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{tontine.name}</h3>
                      <p className="text-gray-600">{tontine.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isLocal && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          Local draft
                        </span>
                      )}
                      {selectionLabel && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                          {selectionLabel}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tontine.status)}`}>
                        {tontine.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-[#00B49F]" />
                      <span className="text-sm text-gray-700 font-medium">
                        {memberLabel}
                        {availableSpots !== null && ` • ${availableSpots} spot${availableSpots === 1 ? '' : 's'} left`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-[#00B49F]" />
                      <span className="text-sm text-gray-700 font-medium">${tontine.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-[#00B49F]" />
                      <span className="text-sm text-gray-700 font-medium">
                        {tontine.totalRounds > 0
                          ? `Round ${tontine.currentRound}/${tontine.totalRounds}`
                          : 'Flexible rounds'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-[#00B49F]" />
                      <span className="text-sm text-gray-700 font-medium">${tontine.contributionAmount.toFixed(2)}/round</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">Group ID: {tontine.gid}</div>
                    <div className="flex flex-wrap gap-2">
                      {isLocal && (
                        <button
                          type="button"
                          onClick={() => handleJoinTontine(tontine.id)}
                          disabled={userIsMember || isFull}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                            userIsMember
                              ? 'border-green-200 text-green-700 bg-green-50 cursor-default'
                              : isFull
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                              : 'border-[#00B49F] text-[#00B49F] hover:bg-[#00B49F]/10'
                          }`}
                        >
                          {userIsMember ? 'Joined' : isFull ? 'Group full' : 'Join group'}
                        </button>
                      )}
                      <Link
                        href={`/dashboard/tontines/${tontine.id}`}
                        className="bg-gradient-to-r from-[#00B49F] to-[#00A08A] text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <CreateTontineModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTontine}
      />
    </div>
  );
}
