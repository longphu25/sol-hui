import { Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { useAnchorWallet } from './use-anchor-wallet'
import * as anchor from '@coral-xyz/anchor'
import { AnchorProvider, Program } from '@coral-xyz/anchor'

import { sontineIdl } from '@/assets/idls/sontine'
import { useCallback, useMemo } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { CycleDuration, SelectionMethod } from '@/utils/sontine.type'

// Define AuctionConfig type locally since it's not exported from sontine.type
type AuctionConfig = {
  auctionDuration: number
  minBidIncrement: number
  maxInterestRate: number
}

export type SelectionMethodKind = 'auction' | 'random' | 'fixedOrder'
export type CycleDurationKind = 'weekly' | 'monthly' | 'custom'
export type GroupStatusKind = 'forming' | 'active' | 'paused' | 'completed' | 'cancelled'
export type MemberStatusKind = 'active' | 'received' | 'left'

type AnchorBN = anchor.BN
type NumericValue = AnchorBN | bigint | number | string | null | undefined

export interface GroupAccountData {
  admin: PublicKey
  groupId: NumericValue
  selectionMethod: Record<string, unknown> | number
  status: Record<string, unknown> | number
  maxMembers: number
  currentMembers: number
  contributionAmount: NumericValue
  cycleDuration: Record<string, any> | number
  createdAt: NumericValue
  startedAt: NumericValue
  currentRound: number
  totalRounds: number
  vault: PublicKey
  vaultBump: number
  fixedOrder: PublicKey[]
  isPaused: boolean
  minMembersToStart: number
  auctionConfig: Record<string, unknown> | null
  totalCollected: NumericValue
  totalDistributed: NumericValue
}

export interface MemberAccountData {
  member: PublicKey
  group: PublicKey
  status: Record<string, unknown> | number
  joinedAt: NumericValue
  receivedRound: number | null | NumericValue
  totalContributions: NumericValue
  totalInterestEarned: NumericValue
  pendingRefundAmount: NumericValue
  lastContributionAt: NumericValue
  lastPayoutAt: NumericValue
}

export interface GroupAccountView {
  address: string
  account: GroupAccountData
  admin: string
  groupId: number
  status: GroupStatusKind
  selectionMethod: SelectionMethodKind
  cycleDuration: CycleDurationKind
  customDurationSeconds: number | null
  customDurationDays: number | null
  maxMembers: number
  currentMembers: number
  minMembersToStart: number
  totalRounds: number
  contributionAmount: {
    raw: bigint
    tokens: number
    decimals: number
  }
  totalCollected: {
    raw: bigint
    tokens: number
  }
  totalDistributed: {
    raw: bigint
    tokens: number
  }
  createdAt: number
  startedAt: number | null
  vault: string
  fixedOrder: string[]
}

export interface MemberAccountView {
  address: string
  account: MemberAccountData
  groupAddress: string
  memberAddress: string
  status: MemberStatusKind
  joinedAt: number
  receivedRound: number | null
  totalContributions: {
    raw: bigint
    tokens: number
  }
  totalInterestEarned: {
    raw: bigint
    tokens: number
  }
  pendingRefundAmount: {
    raw: bigint
    tokens: number
  }
  lastContributionAt: number | null
  lastPayoutAt: number | null
}

export const USDC_MINT = 'A43qEjwWtEkNUzSxd1d9eEe6tDhwR12wFnRdA1gGRvxG' //fake USDC mint for testing
export const USDC_DECIMALS = 6
export const CURRENCY_SYMBOL = 'USDC'

function useOptionalConnection(): Connection | null {
  try {
    const context = useConnection()
    return context.connection ?? null
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useSontineProgram] ConnectionProvider not found; falling back to null connection')
    }
    return null
  }
}

export function useSontineProgram() {
  const connection = useOptionalConnection()
  const anchorWallet = useAnchorWallet()
  const queryClient = useQueryClient()

  // Create provider when wallet is available
  const provider = useMemo(() => {
    if (!anchorWallet || !connection) {
      return
    }
    return new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: 'confirmed',
      commitment: 'processed',
    })
  }, [anchorWallet, connection])

  // Initialize program with provider
  const sontineProgram = useMemo(() => {
    if (!provider) {
      console.log('Provider is not available, cannot initialize program')
      return
    }

    // Create program instance with correct argument order
    const program = new Program<anchor.Idl>(sontineIdl as unknown as anchor.Idl, provider)

    console.log('Sontine program initialized with ID:', program.programId.toBase58())
    return program
  }, [provider])

  const groupAccounts = useQuery<{ publicKey: PublicKey; account: GroupAccountData }[]>({
    queryKey: ['get-group-accounts'],
    queryFn: async () => {
      if (!sontineProgram) {
        return []
      }
      console.log('Fetching group accounts')
      const accounts = await (sontineProgram.account as any).group.all()
      // order accounts by id before returning
      return accounts.sort(
        (
          a: { account: GroupAccountData; publicKey: PublicKey },
          b: { account: GroupAccountData; publicKey: PublicKey },
        ) => bnToNumber(a.account.groupId) - bnToNumber(b.account.groupId),
      )
    },
    enabled: !!sontineProgram,
  })

  const groupViews = useMemo(() => {
    if (!groupAccounts.data) {
      return [] as GroupAccountView[]
    }

    return groupAccounts.data.map(({ publicKey, account }) => mapGroupAccount(publicKey, account))
  }, [groupAccounts.data])

  const confirmSignature = useCallback(
    async (signature: string) => {
      if (!connection) {
        return
      }
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
    },
    [connection],
  )

  // Create group mutation
  const createGroup = useMutation({
    mutationKey: ['create-group'],
    mutationFn: async (payload: {
      selectionMethod: SelectionMethod
      maxMembers: number
      contributionAmount: number
      cycleDuration: CycleDuration
      minMembersToStart: number
      auctionConfig: AuctionConfig | null
    }) => {
      if (!sontineProgram || !anchorWallet?.publicKey) {
        throw Error('Sontine program not instantiated')
      }

      console.log('Creating group')
      const groupId = new anchor.BN(Math.floor(Math.random() * 10 ** 6))
      const adminPublicKey = anchorWallet.publicKey
      const [groupPda] = getGroupPDA(sontineProgram, adminPublicKey, groupId)
      const [vaultPda] = getVaultPDA(sontineProgram, groupPda)

      return await (sontineProgram as any).methods
        .createGroup(
          groupId,
          payload.selectionMethod,
          payload.maxMembers,
          new anchor.BN(payload.contributionAmount * 10 ** USDC_DECIMALS),
          payload.cycleDuration,
          payload.minMembersToStart,
          payload.auctionConfig
            ? {
                auctionDuration: new anchor.BN(payload.auctionConfig.auctionDuration),
                minBidIncrement: payload.auctionConfig.minBidIncrement,
                maxInterestRate: payload.auctionConfig.maxInterestRate,
              }
            : null,
        )
        .accounts({
          group: groupPda,
          vault: vaultPda,
          admin: adminPublicKey,
          mint: new PublicKey(USDC_MINT),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc()
    },
    onSuccess: async (signature: string) => {
      console.log('Group created:', signature)
      await confirmSignature(signature)
      await groupAccounts.refetch()
      await getOverview.refetch()
    },
    onError: (error: Error) => {
      console.log('Create group error:', error)
    },
  })

  const joinGroup = useMutation({
    mutationKey: ['join-group'],
    mutationFn: async (groupAddress: string) => {
      if (!sontineProgram || !anchorWallet?.publicKey) {
        throw Error('Sontine program not instantiated')
      }

      const groupPublicKey = new PublicKey(groupAddress)
      const memberPublicKey = anchorWallet.publicKey
      const [memberAccount] = getMemberPDA(sontineProgram, groupPublicKey, memberPublicKey)

      const signature = await (sontineProgram as any).methods
        .joinGroup()
        .accounts({
          group: groupPublicKey,
          memberAccount,
          member: memberPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      return { signature, groupAddress }
    },
    onSuccess: async ({ signature, groupAddress }: { signature: string; groupAddress: string }) => {
      console.log('Joined group:', signature)
      await confirmSignature(signature)

      // refetch get-group, get-group-members, get-member-account
      queryClient.invalidateQueries({
        queryKey: ['get-group', { groupAddress }],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-group-members', { groupAddress }],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-member-account'],
      })
      await getOverview.refetch()
    },
    onError: (error: Error) => {
      console.log('Join group error:', error)
    },
  })

  const startGroup = useMutation({
    mutationKey: ['start-group'],
    mutationFn: async (groupAddress: string) => {
      if (!sontineProgram || !anchorWallet?.publicKey) {
        throw Error('Sontine program not instantiated')
      }

      const groupPublicKey = new PublicKey(groupAddress)
      const [firstRoundPda] = getRoundPDA(sontineProgram, groupPublicKey, 0)

      const signature = await (sontineProgram as any).methods
        .startGroup()
        .accounts({
          group: groupPublicKey,
          firstRound: firstRoundPda,
          admin: anchorWallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      return { signature, groupAddress }
    },
    onSuccess: async ({ signature, groupAddress }: { signature: string; groupAddress: string }) => {
      console.log('Started group:', signature)
      await confirmSignature(signature)

      // refetch get-group, get-group-members, get-member-account
      queryClient.invalidateQueries({
        queryKey: ['get-group'],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-group-members', { groupAddress }],
      })

      queryClient.invalidateQueries({
        queryKey: ['get-round-account', { groupAddress, roundNumber: 0 }],
      })
    },
    onError: (error: Error) => {
      console.log('Start group error:', error)
    },
  })

  const contribute = useMutation({
    mutationKey: ['contribute'],
    mutationFn: async (groupAddress: string) => {
      if (!sontineProgram || !anchorWallet?.publicKey) {
        throw Error('Sontine program not instantiated')
      }

      const groupPublicKey = new PublicKey(groupAddress)
      const memberPublicKey = anchorWallet.publicKey

      const group = await (sontineProgram.account as any).group.fetch(groupPublicKey)
      const roundNumber = group.currentRound
      const contributeAmount = group.contributionAmount
      const [roundPda] = getRoundPDA(sontineProgram, groupPublicKey, roundNumber)
      const [vaultPda] = getVaultPDA(sontineProgram, groupPublicKey)
      const [memberAccount] = getMemberPDA(sontineProgram, groupPublicKey, memberPublicKey)
      const signature = await (sontineProgram as any).methods
        .contribute(roundNumber, contributeAmount)
        .accounts({
          group: groupPublicKey,
          member: memberPublicKey,
          round: roundPda,
          vault: vaultPda,
          mint: new PublicKey(USDC_MINT),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          memberAccount,
          memberTokenAccount: await getMemberTokenAccount(memberPublicKey),
        })
        .rpc()

      return { signature, groupAddress, roundNumber }
    },
    onSuccess: async ({
      signature,
      groupAddress,
      roundNumber,
    }: {
      signature: string
      groupAddress: string
      roundNumber: number
    }) => {
      console.log('Contributed to group:', signature, groupAddress, roundNumber)
      await confirmSignature(signature)

      // refetch get-member-account
      queryClient.invalidateQueries({
        queryKey: ['get-group', { groupAddress }],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-round-account', { groupAddress, roundNumber }],
      })
      await getOverview.refetch()
    },
    onError: (error: Error) => {
      console.log('Contribute error:', error)
    },
  })

  const startRound = useMutation({
    mutationKey: ['start-round'],
    mutationFn: async ({ groupAddress, roundNumber }: { groupAddress: string; roundNumber: number }) => {
      if (!sontineProgram || !anchorWallet?.publicKey) {
        throw Error('Sontine program not instantiated')
      }

      const groupPublicKey = new PublicKey(groupAddress)
      const [roundPda] = getRoundPDA(sontineProgram, groupPublicKey, roundNumber)

      const signature = await (sontineProgram as any).methods
        .startRound(roundNumber)
        .accounts({
          group: groupPublicKey,
          round: roundPda,
          admin: anchorWallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      return { signature, groupAddress, roundNumber }
    },
    onSuccess: async ({
      signature,
      groupAddress,
      roundNumber,
    }: {
      signature: string
      groupAddress: string
      roundNumber: number
    }) => {
      console.log('Started round:', signature)
      await confirmSignature(signature)

      // refetch get-group, get-round-account
      queryClient.invalidateQueries({
        queryKey: ['get-group', { groupAddress }],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-round-account', { groupAddress, roundNumber }],
      })
    },
    onError: (error: Error) => {
      console.log('Start round error:', error)
    },
  })

  const selectWinner = useMutation({
    mutationKey: ['select-winner'],
    mutationFn: async ({ groupAddress }: { groupAddress: string }) => {
      const walletPublicKey = anchorWallet?.publicKey
      if (!sontineProgram || !walletPublicKey) {
        throw Error('Sontine program not instantiated')
      }

      const groupPublicKey = new PublicKey(groupAddress)
      const group = await (sontineProgram.account as any).group.fetch(groupPublicKey)
      const roundNumber = group.currentRound
      const [roundPda] = getRoundPDA(sontineProgram, groupPublicKey, roundNumber)

      const usesAuction = mapSelectionMethod(group.selectionMethod) === 'auction'

      const signature = await (sontineProgram as any).methods
        .selectWinner(roundNumber, [])
        .accountsPartial({
          group: groupPublicKey,
          round: roundPda,
          authority: anchorWallet?.publicKey,
          auctionRound: usesAuction
            ? getAuctionPDA(sontineProgram, groupPublicKey, roundNumber)[0]
            : undefined,
        })
        .rpc()

      return { signature, groupAddress, roundNumber }
    },
    onSuccess: async ({
      signature,
      groupAddress,
      roundNumber,
    }: {
      signature: string
      groupAddress: string
      roundNumber: number
    }) => {
      console.log('Selected winner:', signature)
      await confirmSignature(signature)

      // refetch get-group, get-round-account
      queryClient.invalidateQueries({
        queryKey: ['get-group', { groupAddress }],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-round-account', { groupAddress, roundNumber }],
      })
    },
    onError: (error: Error) => {
      console.log('Select winner error:', error)
    },
  })

  const distributeFunds = useMutation({
    mutationKey: ['distribute-funds'],
    mutationFn: async ({ groupAddress }: { groupAddress: string }) => {
      const walletPublicKey = anchorWallet?.publicKey
      if (!sontineProgram || !walletPublicKey) {
        throw Error('Sontine program not instantiated')
      }

      const groupPublicKey = new PublicKey(groupAddress)
      const group = await (sontineProgram.account as any).group.fetch(groupPublicKey)
      const roundNumber = group.currentRound
      const [roundPda] = getRoundPDA(sontineProgram, groupPublicKey, roundNumber)
      const roundAccount = await (sontineProgram.account as any).round.fetch(roundPda)
      const winner = roundAccount.selectedMember
      if (!winner) {
        throw Error('No winner selected')
      }

      const winnerPublicKey = new PublicKey(winner)
      const [winnerMemberPda] = getMemberPDA(sontineProgram, groupPublicKey, winnerPublicKey)
      const [vaultPda] = getVaultPDA(sontineProgram, groupPublicKey)

      const signature = await (sontineProgram as any).methods
        .distributeFunds(roundNumber)
        .accounts({
          group: groupPublicKey,
          memberAccount: winnerMemberPda,
          round: roundPda,
          vault: vaultPda,
          memberTokenAccount: await getMemberTokenAccount(winnerPublicKey),
          mint: new PublicKey(USDC_MINT),
          selectedMember: winnerPublicKey,
          authority: walletPublicKey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc()

      return { signature, groupAddress, roundNumber }
    },
    onSuccess: async ({
      signature,
      groupAddress,
      roundNumber,
    }: {
      signature: string
      groupAddress: string
      roundNumber: number
    }) => {
      console.log('Distributed funds:', signature)
      await confirmSignature(signature)

      // refetch get-group, get-round-account
      queryClient.invalidateQueries({
        queryKey: ['get-group', { groupAddress }],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-round-account', { groupAddress, roundNumber }],
      })
    },
    onError: (error: Error) => {
      console.log('Distribute funds error:', error)
    },
  })

  const finalizeRound = useMutation({
    mutationKey: ['finalize-round'],
    mutationFn: async ({ groupAddress }: { groupAddress: string }) => {
      if (!sontineProgram || !anchorWallet?.publicKey) {
        throw Error('Sontine program not instantiated')
      }

      const groupPublicKey = new PublicKey(groupAddress)
      const group = await (sontineProgram.account as any).group.fetch(groupPublicKey)
      const roundNumber = group.currentRound
      const [roundPda] = getRoundPDA(sontineProgram, groupPublicKey, roundNumber)

      const signature = await (sontineProgram as any).methods
        .finalizeRound(roundNumber)
        .accounts({
          group: groupPublicKey,
          round: roundPda,
          admin: anchorWallet.publicKey,
        })
        .rpc()

      return { signature, groupAddress, roundNumber }
    },
    onSuccess: async ({
      signature,
      groupAddress,
      roundNumber,
    }: {
      signature: string
      groupAddress: string
      roundNumber: number
    }) => {
      console.log('Finalized round:', signature)
      await confirmSignature(signature)

      // refetch get-group, get-round-account
      queryClient.invalidateQueries({
        queryKey: ['get-group', { groupAddress }],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-round-account', { groupAddress, roundNumber }],
      })
    },
    onError: (error: Error) => {
      console.log('Finalize round error:', error)
    },
  })

  const getOverview = useQuery({
    queryKey: ['get-overview'],
    queryFn: async () => {
      if (!sontineProgram) {
        return null
      }

      try {
        const groupAccounts = await (sontineProgram.account as any).group.all()
        const fundsRaised = groupAccounts.reduce(
          (acc: number, account: { account: GroupAccountData }) => acc + account.account.currentMembers,
          0,
        )
        const memberAccounts = await (sontineProgram.account as any).member.all()
        // de-duplicate members base on field member in data
        const activeMembers = memberAccounts.reduce((acc: string[], item: { account: MemberAccountData }) => {
          const memberAddress = item.account.member.toString()
          if (!acc.includes(memberAddress)) {
            acc.push(memberAddress)
          }
          return acc
        }, [])

        const roundAccount = await (sontineProgram.account as any).round.all()
        const completedCycles = roundAccount.filter(
          (account: { account: { status: number } }) => account.account.status === 3,
        ).length
        return {
          totalGroups: groupAccounts.length,
          fundsRaised,
          activeMembers: activeMembers.length,
          completedCycles,
        }
      } catch (_error) {
        console.error('Error fetching overview:', _error)
        throw _error
      }
    },
    enabled: !!sontineProgram,
  })

  const placeBid = useMutation({
    mutationKey: ['place-bid'],
    mutationFn: async ({ groupAddress, bidAmount }: { groupAddress: string; bidAmount: number }) => {
      if (!sontineProgram || !anchorWallet?.publicKey) {
        throw Error('Sontine program not instantiated')
      }

      const groupPublicKey = new PublicKey(groupAddress)
      const group = await (sontineProgram.account as any).group.fetch(groupPublicKey)
      const roundNumber = group.currentRound
      const [memberAccount] = getMemberPDA(sontineProgram, groupPublicKey, anchorWallet.publicKey)
      const [auctionRound] = getAuctionPDA(sontineProgram, groupPublicKey, roundNumber)

      const signature = await (sontineProgram as any).methods
        .placeBid(roundNumber, bidAmount)
        .accountsPartial({
          group: groupPublicKey,
          memberAccount,
          auctionRound,
          member: anchorWallet.publicKey,
        })
        .rpc()

      return { signature, groupAddress, roundNumber }
    },
    onSuccess: async ({
      signature,
      groupAddress,
      roundNumber,
    }: {
      signature: string
      groupAddress: string
      roundNumber: number
    }) => {
      console.log('Placed bid:', signature)
      await confirmSignature(signature)

      // refetch get-group, get-round-account
      queryClient.invalidateQueries({
        queryKey: ['get-group', { groupAddress }],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-round-account', { groupAddress, roundNumber }],
      })
    },
    onError: (error: Error) => {
      console.log('Place bid error:', error)
    },
  })

  return {
    sontineProgram,
    groupAccounts,
    groupViews,
    createGroup,
    joinGroup,
    startGroup,
    startRound,
    contribute,
    selectWinner,
    distributeFunds,
    finalizeRound,
    getOverview,
    placeBid,
  }
}

export function mapGroupAccount(publicKey: PublicKey, account: GroupAccountData): GroupAccountView {
  const status = mapGroupStatus(account.status)
  const selectionMethod = mapSelectionMethod(account.selectionMethod)
  const cycle = mapCycleDuration(account.cycleDuration)

  const contributionRaw = toBigIntSafe(account.contributionAmount)
  const totalCollectedRaw = toBigIntSafe(account.totalCollected)
  const totalDistributedRaw = toBigIntSafe(account.totalDistributed)

  return {
    address: publicKey.toBase58(),
    account,
    admin: toBase58(account.admin),
    groupId: bnToNumber(account.groupId),
    status,
    selectionMethod,
    cycleDuration: cycle.kind,
    customDurationSeconds: cycle.seconds,
    customDurationDays: cycle.days,
    maxMembers: account.maxMembers,
    currentMembers: account.currentMembers,
    minMembersToStart: account.minMembersToStart,
    totalRounds: account.totalRounds,
    contributionAmount: {
      raw: contributionRaw,
      tokens: bnToTokenAmount(contributionRaw, USDC_DECIMALS),
      decimals: USDC_DECIMALS,
    },
    totalCollected: {
      raw: totalCollectedRaw,
      tokens: bnToTokenAmount(totalCollectedRaw, USDC_DECIMALS),
    },
    totalDistributed: {
      raw: totalDistributedRaw,
      tokens: bnToTokenAmount(totalDistributedRaw, USDC_DECIMALS),
    },
    createdAt: bnToNumber(account.createdAt),
    startedAt: bnOptionalToNumber(account.startedAt),
    vault: toBase58(account.vault),
    fixedOrder: Array.isArray(account.fixedOrder)
      ? account.fixedOrder.map((pk) => toBase58(pk))
      : [],
  }
}

export function mapMemberAccount(publicKey: PublicKey, account: MemberAccountData): MemberAccountView {
  const status = mapMemberStatus(account.status)

  const totalContributionsRaw = toBigIntSafe(account.totalContributions)
  const totalInterestRaw = toBigIntSafe(account.totalInterestEarned)
  const pendingRefundRaw = toBigIntSafe(account.pendingRefundAmount)
  const receivedRound = bnOptionalToNumber(account.receivedRound)

  return {
    address: publicKey.toBase58(),
    account,
    groupAddress: toBase58(account.group),
    memberAddress: toBase58(account.member),
    status,
    joinedAt: bnToNumber(account.joinedAt),
    receivedRound,
    totalContributions: {
      raw: totalContributionsRaw,
      tokens: bnToTokenAmount(totalContributionsRaw, USDC_DECIMALS),
    },
    totalInterestEarned: {
      raw: totalInterestRaw,
      tokens: bnToTokenAmount(totalInterestRaw, USDC_DECIMALS),
    },
    pendingRefundAmount: {
      raw: pendingRefundRaw,
      tokens: bnToTokenAmount(pendingRefundRaw, USDC_DECIMALS),
    },
    lastContributionAt: bnOptionalToNumber(account.lastContributionAt),
    lastPayoutAt: bnOptionalToNumber(account.lastPayoutAt),
  }
}

function mapGroupStatus(status: unknown): GroupStatusKind {
  if (typeof status === 'object' && status !== null) {
    if ('forming' in (status as Record<string, unknown>)) return 'forming'
    if ('active' in (status as Record<string, unknown>)) return 'active'
    if ('paused' in (status as Record<string, unknown>)) return 'paused'
    if ('completed' in (status as Record<string, unknown>)) return 'completed'
    if ('cancelled' in (status as Record<string, unknown>)) return 'cancelled'
  }

  if (typeof status === 'number') {
    switch (status) {
      case 0:
        return 'forming'
      case 1:
        return 'active'
      case 2:
        return 'paused'
      case 3:
        return 'completed'
      case 4:
        return 'cancelled'
      default:
        return 'forming'
    }
  }

  return 'forming'
}

function mapSelectionMethod(method: unknown): SelectionMethodKind {
  if (typeof method === 'object' && method !== null) {
    if ('auction' in (method as Record<string, unknown>)) return 'auction'
    if ('random' in (method as Record<string, unknown>)) return 'random'
    if ('fixedOrder' in (method as Record<string, unknown>)) return 'fixedOrder'
  }

  if (typeof method === 'number') {
    switch (method) {
      case 0:
        return 'auction'
      case 1:
        return 'random'
      case 2:
        return 'fixedOrder'
      default:
        return 'random'
    }
  }

  return 'random'
}

function mapCycleDuration(
  cycle: unknown,
): { kind: CycleDurationKind; seconds: number | null; days: number | null } {
  if (typeof cycle === 'object' && cycle !== null) {
    const data = cycle as Record<string, any>
    if ('weekly' in data) {
      return { kind: 'weekly', seconds: null, days: null }
    }
    if ('monthly' in data) {
      return { kind: 'monthly', seconds: null, days: null }
    }
    if ('custom' in data) {
      const fields = data.custom?.fields as Array<NumericValue> | undefined
      const seconds = fields?.[0] !== undefined ? bnToNumber(fields[0]) : null
      return {
        kind: 'custom',
        seconds,
        days: seconds ? seconds / 86400 : null,
      }
    }
  }

  if (typeof cycle === 'number') {
    switch (cycle) {
      case 0:
        return { kind: 'weekly', seconds: null, days: null }
      case 1:
        return { kind: 'monthly', seconds: null, days: null }
      case 2:
        return { kind: 'custom', seconds: null, days: null }
      default:
        return { kind: 'weekly', seconds: null, days: null }
    }
  }

  return { kind: 'weekly', seconds: null, days: null }
}

function mapMemberStatus(status: unknown): MemberStatusKind {
  if (typeof status === 'object' && status !== null) {
    if ('active' in (status as Record<string, unknown>)) return 'active'
    if ('received' in (status as Record<string, unknown>)) return 'received'
    if ('left' in (status as Record<string, unknown>)) return 'left'
  }

  if (typeof status === 'number') {
    switch (status) {
      case 0:
        return 'active'
      case 1:
        return 'received'
      case 2:
        return 'left'
      default:
        return 'active'
    }
  }

  return 'active'
}

function toBase58(value: PublicKey | string): string {
  return value instanceof PublicKey ? value.toBase58() : value
}

function toBigIntSafe(value: NumericValue): bigint {
  if (value === null || value === undefined) {
    return BigInt(0)
  }
  if (typeof value === 'bigint') {
    return value
  }
  if (typeof value === 'number') {
    return BigInt(Math.trunc(value))
  }
  if (typeof value === 'string') {
    return BigInt(value)
  }
  if (value instanceof anchor.BN) {
    return BigInt(value.toString())
  }
  return BigInt(0)
}

function bnToNumber(value: NumericValue): number {
  return Number(toBigIntSafe(value))
}

function bnOptionalToNumber(value: NumericValue): number | null {
  if (value === null || value === undefined) {
    return null
  }
  return bnToNumber(value)
}

function bnToTokenAmount(value: NumericValue, decimals: number): number {
  const big = toBigIntSafe(value)
  if (big === BigInt(0)) {
    return 0
  }
  return Number(big) / 10 ** decimals
}

function isValidPublicKey(value: string | null | undefined): value is string {
  if (!value) {
    return false
  }
  try {
    new PublicKey(value)
    return true
  } catch {
    return false
  }
}

function toU64Seed(value: NumericValue): Buffer {
  const big = toBigIntSafe(value)
  const buffer = Buffer.alloc(8)
  let cursor = big
  for (let index = 0; index < 8; index += 1) {
    buffer[index] = Number(cursor & BigInt(0xff))
    cursor >>= BigInt(8)
  }
  return buffer
}

// Custom hook to get a specific group by address
export function useGetGroup(groupAddress: string) {
  const { sontineProgram } = useSontineProgram()

  return useQuery<GroupAccountData | null>({
    queryKey: ['get-group', { groupAddress }],
    queryFn: async () => {
      if (!sontineProgram || !isValidPublicKey(groupAddress)) {
        return null
      }

      try {
        const account = (await (sontineProgram.account as any).group.fetch(
          new PublicKey(groupAddress),
        )) as GroupAccountData
        return account
      } catch (error) {
        console.error('Error fetching group:', error)
        throw error
      }
    },
    enabled: !!sontineProgram && isValidPublicKey(groupAddress),
  })
}

export function useGroupMembers(groupAddress: string) {
  const { sontineProgram } = useSontineProgram()

  return useQuery<MemberAccountView[]>({
    queryKey: ['get-group-members', { groupAddress }],
    queryFn: async () => {
      if (!sontineProgram || !isValidPublicKey(groupAddress)) {
        return []
      }

      try {
        const groupKey = new PublicKey(groupAddress)
        const accounts = (await (sontineProgram.account as any).member.all([
          {
            memcmp: {
              offset: 8 + 32, // Discriminator + admin pubkey
              bytes: groupKey.toBase58(),
            },
          },
        ])) as { publicKey: PublicKey; account: MemberAccountData }[]
        return accounts.map(({ publicKey, account }) => mapMemberAccount(publicKey, account))
      } catch (error) {
        console.error('Error fetching group members:', error)
        throw error
      }
    },
    enabled: !!sontineProgram && isValidPublicKey(groupAddress),
  })
}

export function useWalletMemberAccounts(memberAddress: string | PublicKey | null | undefined) {
  const { sontineProgram } = useSontineProgram()

  return useQuery<MemberAccountView[]>({
    queryKey: ['get-wallet-member-accounts', memberAddress ? memberAddress.toString() : null],
    queryFn: async () => {
      if (!sontineProgram || !memberAddress) {
        return []
      }

      const memberKey =
        memberAddress instanceof PublicKey ? memberAddress : new PublicKey(memberAddress)

      const accounts = (await (sontineProgram.account as any).member.all([
        {
          memcmp: {
            offset: 8, // discriminator
            bytes: memberKey.toBase58(),
          },
        },
      ])) as { publicKey: PublicKey; account: MemberAccountData }[]

      return accounts.map(({ publicKey, account }) => mapMemberAccount(publicKey, account))
    },
    enabled: !!sontineProgram && !!memberAddress,
  })
}

export function useMemberAccount(groupAddress: string, memberAddress: string) {
  const { sontineProgram } = useSontineProgram()

  return useQuery({
    queryKey: ['get-member-account', { groupAddress, memberAddress }],
    queryFn: async () => {
      if (!sontineProgram || !isValidPublicKey(groupAddress) || !isValidPublicKey(memberAddress)) {
        return null
      }

      try {
        const [memberAccountAddress] = getMemberPDA(
          sontineProgram,
          new PublicKey(groupAddress),
          new PublicKey(memberAddress),
        )
        const account = await (sontineProgram.account as any).member.fetch(memberAccountAddress)
        return account
      } catch (_error) {
        console.error('Error fetching member account:', _error)
        // throw error
        return null
      }
    },
    enabled: !!sontineProgram && isValidPublicKey(groupAddress) && isValidPublicKey(memberAddress),
  })
}

export function useRoundAccount(groupAddress: string, roundNumber: number, enabled: boolean = true) {
  const { sontineProgram } = useSontineProgram()

  return useQuery({
    queryKey: ['get-round-account', { groupAddress, roundNumber }],
    queryFn: async () => {
      if (!sontineProgram || !isValidPublicKey(groupAddress)) {
        return null
      }

      try {
        const [roundAccountAddress] = getRoundPDA(sontineProgram, new PublicKey(groupAddress), roundNumber)
        const account = await (sontineProgram.account as any).round.fetch(roundAccountAddress)
        return account
      } catch (_error) {
        console.error('Error fetching round account:', _error)
        // throw error
        return null
      }
    },
    enabled: !!sontineProgram && isValidPublicKey(groupAddress) && enabled,
  })
}

export function getGroupPDA(program: Program<anchor.Idl>, admin: PublicKey, groupId: NumericValue): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('group'), admin.toBuffer(), toU64Seed(groupId)],
    program.programId,
  )
}

export function getVaultPDA(program: Program<anchor.Idl>, group: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), group.toBuffer()],
    program.programId,
  )
}

export function getMemberPDA(program: Program<anchor.Idl>, group: PublicKey, member: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('member'), group.toBuffer(), member.toBuffer()],
    program.programId,
  )
}

export function getMemberTokenAccount(member: PublicKey): Promise<PublicKey> {
  return getAssociatedTokenAddress(new PublicKey(USDC_MINT), member, false, TOKEN_2022_PROGRAM_ID)
}

export function getRoundPDA(program: Program<anchor.Idl>, group: PublicKey, roundNumber: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('round'), group.toBuffer(), Buffer.from([roundNumber])],
    program.programId,
  )
}

export function getAuctionPDA(program: Program<anchor.Idl>, group: PublicKey, roundNumber: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('auction'), group.toBuffer(), Buffer.from([roundNumber])],
    program.programId,
  )
}
