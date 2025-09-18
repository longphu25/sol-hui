import { useAuthorization } from '@/components/solana/use-authorization'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useMemo } from 'react'

export interface AnchorWallet {
  publicKey: PublicKey
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>
}

export function useAnchorWallet(): AnchorWallet | undefined {
  const { selectedAccount } = useAuthorization()
  const mobileWallet = useMobileWallet()
  return useMemo(() => {
    if (!selectedAccount) {
      return
    }

    return {
      signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T) => {
        const signedTransaction = await mobileWallet.signTransaction(transaction)
        return signedTransaction
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(transactions: T[]) => {
        return await mobileWallet.signAllTransactions(transactions)
      },
      get publicKey() {
        return selectedAccount.publicKey
      },
    }
  }, [mobileWallet, selectedAccount])
}
