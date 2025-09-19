import type { GroupAccountView } from '@/hooks/use-sontine-porgram'
import type { Tontine } from '@/types/tontine'
import type { CycleDuration, SelectionMethod } from '@/utils/sontine.type'
import { ellipsify } from '@/utils/ellipsify'

const SECONDS_IN_DAY = 86400

export function mapGroupViewToTontine(view: GroupAccountView): Tontine {
  const contribution = view.contributionAmount.tokens
  const totalAmount = contribution * view.totalRounds
  const createdAtSeconds = Number.isFinite(view.createdAt) ? view.createdAt : 0
  const createdAtIso = createdAtSeconds
    ? new Date(createdAtSeconds * 1000).toISOString()
    : new Date().toISOString()

  const customDurationDays =
    view.cycleDuration === 'custom'
      ? view.customDurationSeconds
        ? Math.round(view.customDurationSeconds / SECONDS_IN_DAY)
        : view.customDurationDays ?? null
      : null

  return {
    id: view.address,
    name: `Group ${view.groupId}`,
    description: `Admin ${ellipsify(view.admin, 6)}`,
    totalAmount,
    contributionAmount: contribution,
    members: view.currentMembers,
    currentRound: view.account.currentRound ?? 0,
    totalRounds: view.totalRounds,
    nextContribution: null,
    status: view.status,
    myTurn: false,
    biddingOpen: view.selectionMethod === 'auction',
    gid: view.address,
    maxMembers: view.maxMembers,
    minMembersToStart: view.minMembersToStart,
    memberAddresses: undefined,
    source: 'remote',
    createdAt: createdAtIso,
    createdBy: view.admin,
    contractAddress: view.address,
    settings: {
      selectionMethod: view.selectionMethod,
      cycleDuration: view.cycleDuration,
      customDurationDays,
      auctionConfig: null,
    },
  }
}

export function toAnchorSelectionMethod(
  method: 'fixedOrder' | 'random' | 'auction',
): SelectionMethod {
  switch (method) {
    case 'fixedOrder':
      return { fixedOrder: {} }
    case 'auction':
      return { auction: {} }
    case 'random':
    default:
      return { random: {} }
  }
}

export function toAnchorCycleDuration(
  cycle: 'weekly' | 'monthly' | 'custom',
  customDurationDays?: number | null,
): CycleDuration {
  switch (cycle) {
    case 'weekly':
      return { weekly: {} }
    case 'custom': {
      const durationDays = customDurationDays ?? 1
      const seconds = Math.max(1, Math.floor(durationDays)) * SECONDS_IN_DAY
      return { custom: { duration: seconds } }
    }
    case 'monthly':
    default:
      return { monthly: {} }
  }
}
