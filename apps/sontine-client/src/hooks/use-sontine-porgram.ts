import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useAnchorWallet } from './use-anchor-wallet'
import * as anchor from '@coral-xyz/anchor'
import { AnchorProvider, Program } from '@coral-xyz/anchor'

import idl from '@/assets/idls/sontine.json'
import { Sontine } from '@/assets/idls/sontine'
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { CycleDuration, SelectionMethod } from '@/utils/sontine.type'

// Define AuctionConfig type locally since it's not exported from sontine.type
type AuctionConfig = {
  auctionDuration: number
  minBidIncrement: number
  maxInterestRate: number
}

export const USDC_MINT = 'A43qEjwWtEkNUzSxd1d9eEe6tDhwR12wFnRdA1gGRvxG' //fake USDC mint for testing
export const USDC_DECIMALS = 6
export const CURRENCY_SYMBOL = 'USDC'

export function useSontineProgram() {
  const connection = useConnection()
  const anchorWallet = useAnchorWallet()
  const queryClient = useQueryClient()

  // Create provider when wallet is available
  const provider = useMemo(() => {
    if (!anchorWallet) {
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
    const program = new Program(idl as unknown as anchor.Idl, provider) as Program<Sontine>

    console.log('Sontine program initialized with ID:', program.programId.toBase58())
    return program
  }, [provider])

  const groupAccounts = useQuery({
    queryKey: ['get-group-accounts'],
    queryFn: async () => {
      if (!sontineProgram) {
        return []
      }
      console.log('Fetching group accounts')
      const accounts = await sontineProgram.account.group.all()
      // order accounts by id before returning
      return accounts.sort((a, b) => a.account.groupId - b.account.groupId)
    },
    enabled: !!sontineProgram,
  })

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
      if (!sontineProgram) {
        throw Error('Sontine program not instantiated')
      }

      console.log('Creating group')
      const groupId = new anchor.BN(Math.floor(Math.random() * 1000000))

      return await sontineProgram.methods
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
          admin: anchorWallet?.publicKey,
          mint: USDC_MINT,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .rpc()
    },
    onSuccess: async (signature: string) => {
      console.log('Group created:', signature)
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
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
      if (!sontineProgram) {
        throw Error('Sontine program not instantiated')
      }

      return await sontineProgram.methods
        .joinGroup()
        .accounts({
          group: groupAddress,
          member: anchorWallet?.publicKey,
        })
        .rpc()
    },
    onSuccess: async (signature: string) => {
      console.log('Joined group:', signature)
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

      // refetch get-group, get-group-members, get-member-account
      queryClient.invalidateQueries({
        queryKey: ['get-group'],
      })
      queryClient.invalidateQueries({
        queryKey: ['get-group-members'],
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
      if (!sontineProgram) {
        throw Error('Sontine program not instantiated')
      }

      const signature = await sontineProgram.methods
        .startGroup()
        .accounts({
          group: groupAddress,
          admin: anchorWallet?.publicKey,
        })
        .rpc()

      return { signature, groupAddress }
    },
    onSuccess: async ({ signature, groupAddress }: { signature: string; groupAddress: string }) => {
      console.log('Started group:', signature)
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

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
      if (!sontineProgram || !anchorWallet) {
        throw Error('Sontine program not instantiated')
      }

      const group = await sontineProgram.account.group.fetch(groupAddress)
      const roundNumber = group.currentRound
      const contributeAmount = group.contributionAmount
      const [memberAccount] = getMemberPDA(sontineProgram, new PublicKey(groupAddress), anchorWallet?.publicKey)
      const signature = await sontineProgram.methods
        .contribute(roundNumber, contributeAmount)
        .accounts({
          group: groupAddress,
          member: anchorWallet?.publicKey,
          mint: USDC_MINT,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          memberAccount,
          memberTokenAccount: await getMemberTokenAccount(anchorWallet?.publicKey),
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
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

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
      if (!sontineProgram) {
        throw Error('Sontine program not instantiated')
      }

      const signature = await sontineProgram.methods
        .startRound(roundNumber)
        .accounts({
          group: groupAddress,
          admin: anchorWallet?.publicKey,
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
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

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
      if (!sontineProgram) {
        throw Error('Sontine program not instantiated')
      }

      const group = await sontineProgram.account.group.fetch(groupAddress)
      const roundNumber = group.currentRound

      const signature = await sontineProgram.methods
        .selectWinner(roundNumber, [])
        .accountsPartial({
          group: groupAddress,
          authority: anchorWallet?.publicKey,
          auctionRound: group.selectionMethod.auction
            ? getAuctionPDA(sontineProgram, new PublicKey(groupAddress), roundNumber)[0]
            : null,
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
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

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
      if (!sontineProgram) {
        throw Error('Sontine program not instantiated')
      }

      const group = await sontineProgram.account.group.fetch(groupAddress)
      const roundNumber = group.currentRound
      const [roundPda] = getRoundPDA(sontineProgram, new PublicKey(groupAddress), roundNumber)
      const roundAccount = await sontineProgram.account.round.fetch(roundPda)
      const winner = roundAccount.selectedMember
      if (!winner) {
        throw Error('No winner selected')
      }

      const [winnerMemberPda] = getMemberPDA(sontineProgram, new PublicKey(groupAddress), new PublicKey(winner))

      const signature = await sontineProgram.methods
        .distributeFunds(roundNumber)
        .accounts({
          group: groupAddress,
          memberAccount: winnerMemberPda,
          memberTokenAccount: await getMemberTokenAccount(new PublicKey(winner)),
          mint: USDC_MINT,
          selectedMember: new PublicKey(winner),
          authority: anchorWallet?.publicKey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
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
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

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
      if (!sontineProgram) {
        throw Error('Sontine program not instantiated')
      }

      const group = await sontineProgram.account.group.fetch(groupAddress)
      const roundNumber = group.currentRound

      const signature = await sontineProgram.methods
        .finalizeRound(roundNumber)
        .accounts({
          group: groupAddress,
          admin: anchorWallet?.publicKey,
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
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

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
        const groupAccounts = await sontineProgram.account.group.all()
        const fundsRaised = groupAccounts.reduce((acc, account) => acc + account.account.currentMembers, 0)
        const memberAccounts = await sontineProgram.account.member.all()
        // de-duplicate members base on field member in data
        const activeMembers = memberAccounts.reduce((acc, item) => {
          if (!acc.includes(item.account.member.toString())) {
            acc.push(item.account.member.toString())
          }
          return acc
        }, [] as string[])

        const roundAccount = await sontineProgram.account.round.all()
        const completedCycles = roundAccount.filter((account) => account.account.status === 3).length
        return {
          totalGroups: groupAccounts.length,
          fundsRaised,
          activeMembers: activeMembers.length,
          completedCycles,
        }
      } catch (error) {
        console.error('Error fetching overview:', error)
        throw error
      }
    },
    enabled: !!sontineProgram,
  })

  const placeBid = useMutation({
    mutationKey: ['place-bid'],
    mutationFn: async ({ groupAddress, bidAmount }: { groupAddress: string; bidAmount: number }) => {
      if (!sontineProgram || !anchorWallet) {
        throw Error('Sontine program not instantiated')
      }

      const group = await sontineProgram.account.group.fetch(groupAddress)
      const roundNumber = group.currentRound
      const [memberAccount] = getMemberPDA(sontineProgram, new PublicKey(groupAddress), anchorWallet?.publicKey)
      const [auctionRound] = getAuctionPDA(sontineProgram, new PublicKey(groupAddress), roundNumber)

      const signature = await sontineProgram.methods
        .placeBid(roundNumber, bidAmount)
        .accountsPartial({
          group: groupAddress,
          memberAccount,
          auctionRound,
          member: anchorWallet?.publicKey,
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
      const { value: latestBlockhash } = await connection.getLatestBlockhashAndContext()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

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

// Custom hook to get a specific group by address
export function useGetGroup(groupAddress: string) {
  const { sontineProgram } = useSontineProgram()

  return useQuery({
    queryKey: ['get-group', { groupAddress }],
    queryFn: async () => {
      if (!sontineProgram || !groupAddress) {
        return null
      }

      try {
        const account = await sontineProgram.account.group.fetch(groupAddress)
        return account
      } catch (error) {
        console.error('Error fetching group:', error)
        throw error
      }
    },
    enabled: !!sontineProgram && !!groupAddress,
  })
}

export function useGroupMembers(groupAddress: string, limit: number = 10, offset: number = 0) {
  const { sontineProgram } = useSontineProgram()

  return useQuery({
    queryKey: ['get-group-members', { groupAddress }],
    queryFn: async () => {
      if (!sontineProgram || !groupAddress) {
        return null
      }

      try {
        const accounts = await sontineProgram.account.member.all([
          {
            memcmp: {
              offset: 8 + 32, // Discriminator + admin pubkey
              bytes: groupAddress,
            },
          },
        ])
        return accounts
      } catch (error) {
        console.error('Error fetching group members:', error)
        throw error
      }
    },
    enabled: !!sontineProgram && !!groupAddress,
  })
}

export function useMemberAccount(groupAddress: string, memberAddress: string) {
  const { sontineProgram } = useSontineProgram()

  return useQuery({
    queryKey: ['get-member-account', { groupAddress, memberAddress }],
    queryFn: async () => {
      if (!sontineProgram || !groupAddress || !memberAddress) {
        return null
      }

      try {
        const [memberAccountAddress] = getMemberPDA(
          sontineProgram,
          new PublicKey(groupAddress),
          new PublicKey(memberAddress),
        )
        const account = await sontineProgram.account.member.fetch(memberAccountAddress)
        return account
      } catch (error) {
        // console.error('Error fetching member account:', error)
        // throw error
        return null
      }
    },
    enabled: !!sontineProgram && !!groupAddress && !!memberAddress,
  })
}

export function useRoundAccount(groupAddress: string, roundNumber: number, enabled: boolean = true) {
  const { sontineProgram } = useSontineProgram()

  return useQuery({
    queryKey: ['get-round-account', { groupAddress, roundNumber }],
    queryFn: async () => {
      if (!sontineProgram || !groupAddress) {
        return null
      }

      try {
        const [roundAccountAddress] = getRoundPDA(sontineProgram, new PublicKey(groupAddress), roundNumber)
        const account = await sontineProgram.account.round.fetch(roundAccountAddress)
        return account
      } catch (error) {
        // console.error('Error fetching round account:', error)
        // throw error
        return null
      }
    },
    enabled: !!sontineProgram && !!groupAddress && enabled,
  })
}

export function getMemberPDA(program: Program<Sontine>, group: PublicKey, member: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('member'), group.toBuffer(), member.toBuffer()],
    program.programId,
  )
}

export function getMemberTokenAccount(member: PublicKey): Promise<PublicKey> {
  return getAssociatedTokenAddress(new PublicKey(USDC_MINT), member, false, TOKEN_2022_PROGRAM_ID)
}

export function getRoundPDA(program: Program<Sontine>, group: PublicKey, roundNumber: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('round'), group.toBuffer(), Buffer.from([roundNumber])],
    program.programId,
  )
}

export function getAuctionPDA(program: Program<Sontine>, group: PublicKey, roundNumber: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('auction'), group.toBuffer(), Buffer.from([roundNumber])],
    program.programId,
  )
}
