import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useMemo } from 'react'

export interface AnchorWallet {
  publicKey: PublicKey
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>
}

export function useAnchorWallet(): AnchorWallet | undefined {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()

  return useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      return undefined
    }

    return {
      publicKey,
      signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T) => {
        const signed = await signTransaction(transaction as Transaction)
        return signed as T
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(transactions: T[]) => {
        const signed = await signAllTransactions(transactions as Transaction[])
        return signed as T[]
      },
    }
  }, [publicKey, signAllTransactions, signTransaction])
}
