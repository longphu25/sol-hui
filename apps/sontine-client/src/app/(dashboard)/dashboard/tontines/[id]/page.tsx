'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  Activity as ActivityIcon,
} from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { useAuth } from '@/components/auth/auth-provider';
import { useLocalTontines } from '@/hooks/use-local-tontines';
import {
  mapGroupAccount,
  useGetGroup,
  useGroupMembers,
  useSontineProgram,
  type GroupAccountView,
} from '@/hooks/use-sontine-porgram';
import { ellipsify } from '@/utils/ellipsify';
import type { Tontine, TontineStatus } from '@/types/tontine';

interface StatusMeta {
  label: string;
  bgClass: string;
  textClass: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  canJoin: boolean;
}

const statusMeta: Record<TontineStatus | 'pending', StatusMeta> = {
  active: {
    label: 'Active',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    icon: CheckCircle2,
    description: 'Rounds are currently running for this tontine.',
    canJoin: false,
  },
  forming: {
    label: 'Forming',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    icon: Clock,
    description: 'The group is accepting new members before the first round.',
    canJoin: true,
  },
  pending: {
    label: 'Pending',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
    icon: Clock,
    description: 'Setup is in progress. Membership may still be open.',
    canJoin: true,
  },
  completed: {
    label: 'Completed',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    icon: CheckCircle2,
    description: 'All rounds have been completed for this tontine.',
    canJoin: false,
  },
  paused: {
    label: 'Paused',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
    icon: AlertCircle,
    description: 'Rounds are temporarily paused by the organizer.',
    canJoin: false,
  },
  cancelled: {
    label: 'Cancelled',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    icon: AlertCircle,
    description: 'This tontine has been cancelled.',
    canJoin: false,
  },
};

function groupViewToTontine(view: GroupAccountView): Tontine {
  const contribution = view.contributionAmount.tokens;
  const totalAmount = contribution * view.totalRounds;
  const createdAtSeconds = Number.isFinite(view.createdAt) ? view.createdAt : 0;

  return {
    id: view.address,
    name: `Group ${view.groupId}`,
    description: `Admin ${ellipsify(view.admin, 6)}`,
    totalAmount,
    contributionAmount: contribution,
    members: view.currentMembers,
    currentRound: view.account.currentRound,
    totalRounds: view.totalRounds,
    nextContribution: null,
    status: mapStatusToTontineStatus(view.status),
    myTurn: false,
    biddingOpen: view.selectionMethod === 'auction',
    gid: view.address,
    maxMembers: view.maxMembers,
    minMembersToStart: view.minMembersToStart,
    memberAddresses: undefined,
    source: 'remote',
    createdAt: createdAtSeconds
      ? new Date(createdAtSeconds * 1000).toISOString()
      : new Date().toISOString(),
    createdBy: view.admin,
    contractAddress: view.address,
    settings: {
      selectionMethod: view.selectionMethod,
      cycleDuration: view.cycleDuration,
      customDurationDays: view.customDurationDays ? Math.round(view.customDurationDays) : null,
      auctionConfig: null,
    },
  };
}

function mapStatusToTontineStatus(status: GroupAccountView['status']): Tontine['status'] {
  switch (status) {
    case 'forming':
      return 'forming';
    case 'active':
      return 'active';
    case 'paused':
      return 'paused';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function getStatusInfo(status: TontineStatus | 'pending'): StatusMeta {
  return statusMeta[status] ?? statusMeta.pending;
}

function buildActivityFeed(
  tontine: Tontine,
  isLocal: boolean,
  memberCount: number,
  groupView?: GroupAccountView | null,
) {
  if (isLocal) {
    const createdAt = tontine.createdAt ? new Date(tontine.createdAt).toLocaleString() : 'Recently';
    return [
      {
        title: 'Group created',
        subtitle: tontine.createdBy ? `Created by ${ellipsify(tontine.createdBy, 6)}` : 'Draft stored locally',
        timestamp: createdAt,
      },
      {
        title: 'Member roster',
        subtitle: `${memberCount} participant${memberCount === 1 ? '' : 's'} currently added`,
        timestamp: 'Synced locally',
      },
    ];
  }

  return [
    {
      title: 'Group created on-chain',
      subtitle: groupView
        ? `Admin ${ellipsify(groupView.admin, 6)}`
        : `Managed by ${ellipsify(tontine.createdBy ?? tontine.id, 6)}`,
      timestamp: groupView?.createdAt
        ? new Date(groupView.createdAt * 1000).toLocaleString()
        : 'Recent',
    },
    {
      title: 'Member roster',
      subtitle: `${memberCount} on-chain participant${memberCount === 1 ? '' : 's'}`,
      timestamp: 'Live data',
    },
  ];
}

export default function TontineDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const groupAddress = React.useMemo(() => {
    const raw = params?.id;
    if (!raw) {
      return '';
    }
    return Array.isArray(raw) ? raw[0] ?? '' : raw;
  }, [params]);

  const isGroupAddressValid = React.useMemo(() => {
    if (!groupAddress) {
      return false;
    }
    try {
      new PublicKey(groupAddress);
      return true;
    } catch {
      return false;
    }
  }, [groupAddress]);

  const { account } = useAuth();
  const walletAddress = account?.address ?? null;

  const { getTontineById, joinTontine } = useLocalTontines();
  const { joinGroup } = useSontineProgram();

  const groupQuery = useGetGroup(groupAddress);
  const groupMembersQuery = useGroupMembers(groupAddress);

  const localTontine = getTontineById(groupAddress);

  const remoteGroupView = React.useMemo(() => {
    if (!groupQuery.data || !isGroupAddressValid) {
      return null;
    }

    try {
      return mapGroupAccount(new PublicKey(groupAddress), groupQuery.data);
    } catch (error) {
      console.error('Failed to map on-chain group', error);
      return null;
    }
  }, [groupQuery.data, groupAddress, isGroupAddressValid]);

  const remoteTontine = React.useMemo(
    () => (remoteGroupView ? groupViewToTontine(remoteGroupView) : null),
    [remoteGroupView]
  );

  const memberAccounts = React.useMemo(
    () => groupMembersQuery.data ?? [],
    [groupMembersQuery.data],
  );

  if (!groupAddress) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading tontine details...</p>
      </div>
    );
  }

  if (!isGroupAddressValid) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>Invalid tontine address. Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  const tontine = localTontine ?? remoteTontine;
  const remoteMemberAddresses = React.useMemo(
    () => memberAccounts.map((member) => member.memberAddress),
    [memberAccounts]
  );

  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const selectionMethodLabel = React.useMemo(() => {
    const method = tontine?.settings?.selectionMethod;
    switch (method) {
      case 'random':
        return 'Random selection';
      case 'fixedOrder':
        return 'Fixed order selection';
      case 'auction':
        return 'Auction selection';
      default:
        return null;
    }
  }, [tontine?.settings?.selectionMethod]);

  const cycleDurationLabel = React.useMemo(() => {
    const cycle = tontine?.settings?.cycleDuration;
    if (!cycle) return null;
    if (cycle === 'custom') {
      const days = tontine?.settings?.customDurationDays ?? null;
      if (!days) return 'Custom cycle';
      return `${days} day cycle`;
    }
    return `${cycle.charAt(0).toUpperCase()}${cycle.slice(1)} cycle`;
  }, [tontine?.settings?.cycleDuration, tontine?.settings?.customDurationDays]);

  if (!tontine) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/tontines/browse"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to browse
        </Link>
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <Users className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Group not found</h1>
          <p className="text-gray-600">
            We could not locate that tontine. It may have been removed or lives on-chain only.
          </p>
        </div>
      </div>
    );
  }

  const isLocal = tontine.source === 'local';
  const statusInfo = getStatusInfo(tontine.status);
  const StatusIcon = statusInfo.icon;

  const memberList = isLocal
    ? localTontine?.memberAddresses ?? []
    : remoteMemberAddresses;

  const isMember = walletAddress ? memberList.includes(walletAddress) : false;
  const maxCapacity = tontine.maxMembers ?? tontine.totalRounds ?? memberList.length;
  const isFull = isLocal
    ? localTontine
      ? memberList.length >= localTontine.maxMembers
      : false
    : memberList.length >= maxCapacity;

  const activityFeed = buildActivityFeed(
    tontine,
    isLocal,
    memberList.length,
    remoteGroupView ?? undefined,
  );

  const isJoining = joinGroup.isPending;

  const handleJoin = async () => {
    if (localTontine) {
      const result = joinTontine(localTontine.id, walletAddress ?? undefined);

      if (result.success) {
        setFeedback({ type: 'success', text: 'You have joined this tontine.' });
        return;
      }

      switch (result.reason) {
        case 'WALLET_REQUIRED':
          setFeedback({ type: 'error', text: 'Connect your wallet to join this tontine.' });
          break;
        case 'ALREADY_JOINED':
          setFeedback({ type: 'error', text: 'You are already a member of this tontine.' });
          break;
        case 'GROUP_FULL':
          setFeedback({ type: 'error', text: 'This tontine is already full.' });
          break;
        default:
          setFeedback({ type: 'error', text: 'Unable to join the tontine right now.' });
      }
      return;
    }

    if (!remoteTontine) {
      return;
    }

    if (!walletAddress) {
      setFeedback({ type: 'error', text: 'Connect your wallet to join this tontine.' });
      return;
    }

    try {
      await joinGroup.mutateAsync(groupAddress);
      setFeedback({ type: 'success', text: 'You have joined this tontine.' });
    } catch (error) {
      console.error('Join tontine failed', error);
      const message = error instanceof Error ? error.message : 'Failed to join this tontine.';
      setFeedback({ type: 'error', text: message });
    }
  };

  const contractAddress = tontine.contractAddress ?? tontine.id;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/tontines/browse"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to browse
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{tontine.name}</h1>
            <p className="text-gray-600 mt-1">Contract: {ellipsify(contractAddress, 8)}</p>
            <p className="text-gray-600 mt-1">Group ID: {tontine.gid}</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.bgClass}`}>
            <StatusIcon className={`h-4 w-4 ${statusInfo.textClass}`} />
            <span className={`text-sm font-medium ${statusInfo.textClass}`}>{statusInfo.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase text-gray-500">Members</p>
            <p className="text-xl font-semibold text-gray-900">{memberList.length}</p>
            {isLocal && localTontine && (
              <p className="text-xs text-gray-500">Capacity {memberList.length}/{localTontine.maxMembers}</p>
            )}
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase text-gray-500">Contribution</p>
            <p className="text-xl font-semibold text-gray-900">${tontine.contributionAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Per round</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase text-gray-500">Total Pool</p>
            <p className="text-xl font-semibold text-gray-900">${tontine.totalAmount.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase text-gray-500">Round</p>
            <p className="text-xl font-semibold text-gray-900">
              {tontine.currentRound}/{tontine.totalRounds}
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Membership</h2>
        {isMember ? (
          <div className="flex items-center gap-2 text-[#00B49F] font-medium">
            <CheckCircle2 className="h-5 w-5" />
            You are a member of this tontine
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-600">{statusInfo.description}</p>
            <button
              type="button"
              onClick={() => void handleJoin()}
              disabled={!statusInfo.canJoin || isFull || isJoining || (!walletAddress && !isLocal)}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                !statusInfo.canJoin || isFull || isJoining || (!walletAddress && !isLocal)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#00B49F] to-[#00A08A] text-white hover:shadow-md'
              }`}
            >
              {isFull ? 'Group full' : isJoining ? 'Joining…' : 'Join tontine'}
            </button>
          </div>
        )}
        {!walletAddress && !isMember && (
          <p className="text-xs text-gray-500">Connect your wallet to join this tontine.</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Contract details</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Contribution</span>
              <span className="font-medium">${tontine.contributionAmount.toFixed(2)} USDC / round</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Total pool</span>
              <span className="font-medium">${tontine.totalAmount.toFixed(2)} USDC</span>
            </div>
            {selectionMethodLabel && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Selection method</span>
                <span className="font-medium">{selectionMethodLabel}</span>
              </div>
            )}
            {cycleDurationLabel && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Cycle duration</span>
                <span className="font-medium">{cycleDurationLabel}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Max members</span>
              <span className="font-medium">{tontine.maxMembers ?? '—'}</span>
            </div>
            {tontine.createdBy && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Creator</span>
                <span className="font-medium">{ellipsify(tontine.createdBy, 6)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Contract</span>
              <span className="inline-flex items-center gap-2 font-medium">
                <LinkIcon className="h-4 w-4 text-[#00B49F]" />
                {ellipsify(contractAddress, 8)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Members</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-700">
            {memberList.length === 0 ? (
              <li className="text-gray-500">No members added yet.</li>
            ) : (
              memberList.map((member, index) => (
                <li key={`${member}-${index}`} className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#00B49F]" />
                  <span>{ellipsify(member, 6)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-[#00B49F]" /> Activity history
        </h2>
        <div className="mt-4 space-y-4">
          {activityFeed.map((entry, index) => (
            <div key={`${entry.title}-${index}`} className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                <p className="text-sm text-gray-600">{entry.subtitle}</p>
              </div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mt-2 md:mt-0">{entry.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
