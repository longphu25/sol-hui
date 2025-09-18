import { Tontine, TontineStatus } from '@/types/tontine';

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

const GROUP_ACCOUNTS: GroupAccount[] = [
  {
    publicKey: { toString: () => 'group1' },
    account: {
      groupId: 1001,
      contributionAmount: 100_000_000,
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
      contributionAmount: 50_000_000,
      maxMembers: 6,
      currentMembers: 4,
      currentRound: 1,
      totalRounds: 6,
      status: { forming: {} },
      selectionMethod: { random: {} },
    },
  },
  {
    publicKey: { toString: () => 'group3' },
    account: {
      groupId: 1003,
      contributionAmount: 75_000_000,
      maxMembers: 12,
      currentMembers: 12,
      currentRound: 6,
      totalRounds: 12,
      status: { completed: {} },
      selectionMethod: { fixedOrder: {} },
    },
  },
];

const USDC_DECIMALS = 6;

const convertStatus = (status: unknown): TontineStatus => {
  if (typeof status === 'object' && status !== null) {
    const statusObj = status as Record<string, unknown>;
    if ('active' in statusObj) return 'active';
    if ('forming' in statusObj) return 'forming';
    if ('completed' in statusObj) return 'completed';
    if ('paused' in statusObj) return 'paused';
    if ('cancelled' in statusObj) return 'cancelled';
  }

  switch (status) {
    case 0:
      return 'forming';
    case 1:
      return 'active';
    case 2:
      return 'paused';
    case 3:
      return 'completed';
    case 4:
      return 'cancelled';
    default:
      return 'pending';
  }
};

const getSelectionMethodLabel = (selectionMethod: unknown): string => {
  if (typeof selectionMethod === 'object' && selectionMethod !== null) {
    const methodObj = selectionMethod as Record<string, unknown>;
    if ('auction' in methodObj) return 'Auction';
    if ('random' in methodObj) return 'Random';
    if ('fixedOrder' in methodObj) return 'Fixed Order';
    const [firstKey] = Object.keys(methodObj);
    if (firstKey) return firstKey;
  } else if (typeof selectionMethod === 'number') {
    switch (selectionMethod) {
      case 0:
        return 'Auction';
      case 1:
        return 'Random';
      case 2:
        return 'Fixed Order';
      default:
        return 'Unknown';
    }
  }

  return 'Unknown';
};

const convertGroupAccountToTontine = (groupAccount: GroupAccount): Tontine => {
  const { account, publicKey } = groupAccount;
  const contributionAmount = Number(account.contributionAmount || 0) / Math.pow(10, USDC_DECIMALS);

  const memberText =
    account.currentMembers === account.maxMembers
      ? `${account.maxMembers} members`
      : `${account.currentMembers}/${account.maxMembers} members`;

  return {
    id: publicKey.toString(),
    name: `# ${account.groupId} (${getSelectionMethodLabel(account.selectionMethod)})`,
    description: `${memberText} • ${contributionAmount.toFixed(2)} USDC per round`,
    totalAmount: contributionAmount * (account.maxMembers || 0),
    contributionAmount,
    members: account.currentMembers,
    currentRound: account.currentRound,
    totalRounds: account.totalRounds,
    nextContribution: null,
    status: convertStatus(account.status),
    myTurn: false,
    biddingOpen:
      typeof account.selectionMethod === 'object' &&
      account.selectionMethod !== null &&
      'auction' in (account.selectionMethod as Record<string, unknown>) &&
      convertStatus(account.status) === 'active',
    gid: account.groupId.toString(),
    maxMembers: account.maxMembers,
    source: 'remote',
    contractAddress: publicKey.toString(),
    settings: {
      selectionMethod: ((): 'random' | 'fixedOrder' | 'auction' => {
        if (typeof account.selectionMethod === 'object' && account.selectionMethod !== null) {
          if ('auction' in (account.selectionMethod as Record<string, unknown>)) return 'auction';
          if ('random' in (account.selectionMethod as Record<string, unknown>)) return 'random';
          if ('fixedOrder' in (account.selectionMethod as Record<string, unknown>)) return 'fixedOrder';
        }
        if (typeof account.selectionMethod === 'number') {
          switch (account.selectionMethod) {
            case 0:
              return 'auction';
            case 1:
              return 'random';
            case 2:
              return 'fixedOrder';
          }
        }
        return 'random';
      })(),
      cycleDuration: 'monthly',
      customDurationDays: null,
      auctionConfig:
        typeof account.selectionMethod === 'object' && account.selectionMethod !== null &&
        'auction' in (account.selectionMethod as Record<string, unknown>)
          ? {
              auctionDuration: 24 * 3600,
              minBidIncrement: 100,
              maxInterestRate: 2000,
            }
          : null,
    },
  };
};

const REMOTE_TONTINES = GROUP_ACCOUNTS.map(convertGroupAccountToTontine);

export function getMockRemoteTontines(): Tontine[] {
  return REMOTE_TONTINES;
}

export function getMockTontineById(id: string): Tontine | null {
  return REMOTE_TONTINES.find((tontine) => tontine.id === id) ?? null;
}
