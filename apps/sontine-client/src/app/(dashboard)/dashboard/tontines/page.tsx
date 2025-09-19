'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, DollarSign, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { CreateTontineModal } from '@/components/tontines/create-tontine-modal';
import { useLocalTontines, CreateTontineInput } from '@/hooks/use-local-tontines';
import {
  MemberAccountView,
  useSontineProgram,
  useWalletMemberAccounts,
} from '@/hooks/use-sontine-porgram';
import type { Tontine } from '@/types/tontine';
import { ellipsify } from '@/utils/ellipsify';
import {
  mapGroupViewToTontine,
  toAnchorCycleDuration,
  toAnchorSelectionMethod,
} from '@/utils/tontine-mappers';

const statusClassMap: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  forming: 'bg-amber-100 text-amber-700',
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

function TontineSummaryCard({
  tontine,
  label,
}: {
  tontine: Tontine;
  label: string;
}) {
  const statusClass = statusClassMap[tontine.status] ?? 'bg-gray-100 text-gray-700';
  const maxMembers = tontine.maxMembers ?? tontine.totalRounds;
  const memberLabel = `${tontine.members}/${maxMembers} members`;
  const gid = String(tontine.gid ?? tontine.id);
  const groupIdLabel = gid.length > 24 ? ellipsify(gid, 4) : gid;
  const selectionLabel = (() => {
    switch (tontine.settings?.selectionMethod) {
      case 'random':
        return 'Random selection';
      case 'fixedOrder':
        return 'Fixed order';
      case 'auction':
        return 'Auction';
      default:
        return null;
    }
  })();
  const cycleLabel = (() => {
    const cycle = tontine.settings?.cycleDuration;
    if (!cycle) return null;
    if (cycle === 'custom') {
      const days = tontine.settings?.customDurationDays ?? null;
      return days ? `${days} day cycle` : 'Custom cycle';
    }
    return `${cycle.charAt(0).toUpperCase()}${cycle.slice(1)} cycle`;
  })();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
          <h3 className="text-xl font-semibold text-gray-900 mt-1">{tontine.name}</h3>
          <p className="text-gray-600 text-sm mt-2">{tontine.description || 'On-chain tontine group'}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
            {selectionLabel && <span className="rounded-full bg-gray-100 px-2 py-1">{selectionLabel}</span>}
            {cycleLabel && <span className="rounded-full bg-gray-100 px-2 py-1">{cycleLabel}</span>}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>{tontine.status}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#00B49F]" />
          <span>{memberLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#00B49F]" />
          <span>${tontine.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#00B49F]" />
          <span>Round {tontine.currentRound}/{tontine.totalRounds}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#00B49F]" />
          <span>${tontine.contributionAmount.toFixed(2)}/round</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Group ID: {groupIdLabel}</span>
        <Link
          href={`/dashboard/tontines/${tontine.id}`}
          className="inline-flex items-center gap-1 text-[#00B49F] font-medium hover:underline"
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function TontinesPage() {
  const { account } = useAuth();
  const walletAddress = account?.address ?? null;
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { tontines: localTontines, addTontine } = useLocalTontines();
  const { sontineProgram, groupViews, createGroup } = useSontineProgram();
  const walletMembers = useWalletMemberAccounts(walletAddress);

  const remoteTontines = useMemo<Tontine[]>(
    () => groupViews.map((view) => mapGroupViewToTontine(view)),
    [groupViews]
  );

  const memberGroupAddresses = useMemo(() => {
    if (!walletMembers.data) {
      return new Set<string>();
    }
    return new Set(walletMembers.data.map((member: MemberAccountView) => member.groupAddress));
  }, [walletMembers.data]);

  const remoteCreated = useMemo<Tontine[]>(() => {
    if (!walletAddress) return [];
    return remoteTontines.filter((tontine) => tontine.createdBy === walletAddress);
  }, [remoteTontines, walletAddress]);

  const remoteJoined = useMemo<Tontine[]>(() => {
    if (!walletAddress) return [];
    return remoteTontines.filter(
      (tontine) =>
        memberGroupAddresses.has(tontine.contractAddress ?? tontine.id) &&
        tontine.createdBy !== walletAddress
    );
  }, [remoteTontines, memberGroupAddresses, walletAddress]);

  const localCreated = useMemo<Tontine[]>(() => {
    if (!walletAddress) return [];
    return localTontines.filter((tontine) => tontine.createdBy === walletAddress);
  }, [localTontines, walletAddress]);

  const localJoined = useMemo<Tontine[]>(() => {
    if (!walletAddress) return [];
    return localTontines.filter(
      (tontine) =>
        tontine.createdBy !== walletAddress &&
        tontine.memberAddresses?.includes(walletAddress)
    );
  }, [localTontines, walletAddress]);

  const createdByUser = useMemo<Tontine[]>(
    () => [...remoteCreated, ...localCreated],
    [remoteCreated, localCreated]
  );

  const joinedByUser = useMemo<Tontine[]>(
    () => [...remoteJoined, ...localJoined],
    [remoteJoined, localJoined]
  );

  const handleCreate = async (input: CreateTontineInput) => {
    if (!sontineProgram) {
      addTontine({ ...input, creatorAddress: walletAddress });
      setShowCreateModal(false);
      return;
    }

    const selectionMethod = toAnchorSelectionMethod(input.selectionMethod ?? 'random');
    const cycleDuration = toAnchorCycleDuration(
      input.cycleDuration ?? 'monthly',
      input.customDurationDays,
    );

    try {
      await createGroup.mutateAsync({
        selectionMethod,
        maxMembers: input.maxMembers,
        contributionAmount: input.contributionAmount,
        cycleDuration,
        minMembersToStart: input.minMembersToStart,
        auctionConfig: input.selectionMethod === 'auction' ? input.auctionConfig ?? null : null,
      });

      setShowCreateModal(false);
    } catch (error) {
      throw error;
    }
  };

  const isCreating = createGroup.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-gray-900">My Tontines</h1>
          <p className="text-gray-600">Create new tontine groups or manage the ones you have already joined.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00B49F] to-[#00A08A] text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? 'Creating…' : 'Create group'}
          </button>
          <Link
            href="/dashboard/tontines/browse"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Browse groups
          </Link>
        </div>
      </div>

      {!walletAddress && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          Connect your wallet to track the tontines you create or join.
        </div>
      )}

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00B49F]" /> Groups you created
            </h2>
            <p className="text-sm text-gray-600">Drafts and active tontines you launched.</p>
          </div>
        </header>

        {createdByUser.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-6 text-sm text-gray-600">
            {walletAddress ? 'No groups yet. Create one to get started.' : 'Connect a wallet to view the groups you create.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {createdByUser.map((tontine) => (
              <TontineSummaryCard key={tontine.id} tontine={tontine} label="Creator" />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00B49F]" /> Groups you joined
            </h2>
            <p className="text-sm text-gray-600">Keep track of your commitments across different tontines.</p>
          </div>
        </header>

        {joinedByUser.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-6 text-sm text-gray-600">
            {walletAddress
              ? 'You have not joined any groups yet. Browse tontines to find one that fits.'
              : 'Connect a wallet to see the tontines you have joined.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {joinedByUser.map((tontine) => (
              <TontineSummaryCard key={tontine.id} tontine={tontine} label="Member" />
            ))}
          </div>
        )}
      </section>

      <CreateTontineModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
    </div>
  );
}
