import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
// VersionedTransactionResponse
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

// USDC Token Address on Devnet
// const USDC_MINT_DEVNET = new PublicKey('4zMMC9sRT5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const USDC_MINT_DEVNET = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
// USDC Token Address on Mainnet
const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export interface WalletBalance {
  sol: number;
  usdc: number;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalReceived: number;
  totalSent: number;
}

export interface RecentTransaction {
  signature: string;
  type: 'send' | 'receive' | 'unknown';
  amount: number;
  timestamp: number;
  counterparty?: string;
  status: 'confirmed' | 'finalized' | 'processed';
}

export class SolanaService {
  constructor(private connection: Connection) {}

  /**
   * Fetch SOL and USDC balances for a wallet
   */
  async getWalletBalance(publicKey: PublicKey, isMainnet = false): Promise<WalletBalance> {
    try {
      // Get SOL balance
      const solBalance = await this.connection.getBalance(publicKey);
      const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;

      // Get USDC balance
      let usdcBalance = 0;
      try {
        const usdcMint = isMainnet ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
        const usdcTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey);
        
        const accountInfo = await getAccount(this.connection, usdcTokenAccount);
        // USDC has 6 decimals
        usdcBalance = Number(accountInfo.amount) / Math.pow(10, 6);
      } catch (error) {
        // Token account might not exist, which means 0 balance
        console.log('USDC token account not found or error fetching balance:', error);
        usdcBalance = 0;
      }

      return {
        sol: solBalanceFormatted,
        usdc: usdcBalance,
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  /**
   * Request SOL airdrop (devnet only)
   */
  async requestAirdrop(publicKey: PublicKey, amount = 1): Promise<string> {
    try {
      const airdropSignature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(airdropSignature);
      
      return airdropSignature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      throw new Error('Failed to request airdrop. Make sure you are connected to devnet.');
    }
  }

  /**
   * Get recent transactions for a wallet
   */
  async getRecentTransactions(
    publicKey: PublicKey,
    limit = 10
  ): Promise<RecentTransaction[]> {
    try {
      const signatures = await this.connection.getSignaturesForAddress(publicKey, {
        limit,
      });

      const transactions: RecentTransaction[] = [];

      for (const signatureInfo of signatures) {
        try {
          const transaction = await this.connection.getTransaction(signatureInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (transaction) {
            const txData = this.parseTransaction(transaction, publicKey);
            if (txData) {
              transactions.push({
                signature: signatureInfo.signature,
                ...txData,
                timestamp: (signatureInfo.blockTime || 0) * 1000, // Convert to milliseconds
                status: signatureInfo.confirmationStatus || 'confirmed',
              });
            }
          }
        } catch (error) {
          console.error('Error parsing transaction:', error);
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw new Error('Failed to fetch recent transactions');
    }
  }

  /**
   * Parse transaction to determine type and amount
   */
  private parseTransaction(
    transaction: Record<string, unknown>,
    walletPublicKey: PublicKey
  ): Pick<RecentTransaction, 'type' | 'amount' | 'counterparty'> | null {
    try {
      const { meta, transaction: tx } = transaction;
      
      if (!meta || !tx) return null;

      const preBalances = (meta as Record<string, unknown>).preBalances as number[];
      const postBalances = (meta as Record<string, unknown>).postBalances as number[];
      const txMessage = (tx as Record<string, unknown>).message as Record<string, unknown>;
      const accountKeys = (txMessage.accountKeys || txMessage.staticAccountKeys || []) as PublicKey[];

      // Find the wallet's account index
      const walletIndex = accountKeys.findIndex((key: PublicKey) => 
        key.equals ? key.equals(walletPublicKey) : key.toString() === walletPublicKey.toString()
      );

      if (walletIndex === -1) return null;

      const preBalance = preBalances[walletIndex] || 0;
      const postBalance = postBalances[walletIndex] || 0;
      const balanceChange = (postBalance - preBalance) / LAMPORTS_PER_SOL;

      // Determine transaction type and counterparty
      let type: 'send' | 'receive' | 'unknown' = 'unknown';
      let counterparty: string | undefined;

      if (balanceChange > 0) {
        type = 'receive';
        // Find the sender (account that lost balance)
        for (let i = 0; i < preBalances.length; i++) {
          if (i !== walletIndex && preBalances[i] > postBalances[i]) {
            counterparty = accountKeys[i]?.toString();
            break;
          }
        }
      } else if (balanceChange < 0) {
        type = 'send';
        // Find the receiver (account that gained balance)
        for (let i = 0; i < preBalances.length; i++) {
          if (i !== walletIndex && preBalances[i] < postBalances[i]) {
            counterparty = accountKeys[i]?.toString();
            break;
          }
        }
      }

      return {
        type,
        amount: Math.abs(balanceChange),
        counterparty,
      };
    } catch (error) {
      console.error('Error parsing transaction:', error);
      return null;
    }
  }

  /**
   * Get transaction summary statistics
   */
  async getTransactionSummary(publicKey: PublicKey): Promise<TransactionSummary> {
    try {
      const transactions = await this.getRecentTransactions(publicKey, 50); // Get more for better stats
      
      const totalTransactions = transactions.length;
      const totalReceived = transactions
        .filter(tx => tx.type === 'receive')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const totalSent = transactions
        .filter(tx => tx.type === 'send')
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        totalTransactions,
        totalReceived,
        totalSent,
      };
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      return {
        totalTransactions: 0,
        totalReceived: 0,
        totalSent: 0,
      };
    }
  }
}