export type TontineStatus = 'forming' | 'active' | 'pending' | 'completed' | 'paused' | 'cancelled';

export interface Tontine {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  contributionAmount: number;
  members: number;
  currentRound: number;
  totalRounds: number;
  nextContribution: string | null;
  status: TontineStatus;
  myTurn: boolean;
  biddingOpen: boolean;
  gid: string;
  maxMembers?: number;
  minMembersToStart?: number;
  memberAddresses?: string[];
  source?: 'local' | 'remote';
  createdAt?: string;
  createdBy?: string | null;
  contractAddress?: string;
  settings?: {
    selectionMethod?: 'fixedOrder' | 'random' | 'auction';
    cycleDuration?: 'weekly' | 'monthly' | 'custom';
    customDurationDays?: number | null;
    auctionConfig?: {
      auctionDuration?: number;
      minBidIncrement?: number;
      maxInterestRate?: number;
    } | null;
  };
}
