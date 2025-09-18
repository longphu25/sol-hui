'use client';

import React from 'react';
import { ArrowLeft, Zap, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useWebWallet } from '@/components/solana/use-web-wallet';
import { useWalletData } from '@/components/wallet/wallet-provider';
import { useCluster } from '@/components/cluster/cluster-provider';
import { ClusterNetwork } from '@/constants/app-config';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function AirdropPage() {
  // Get wallet data and functions
  const { account } = useWebWallet();
  const {
    balance,
    isRequestingAirdrop,
    airdropError,
    lastAirdropTx,
    requestAirdrop,
  } = useWalletData();
  const { selectedCluster } = useCluster();
  
  const isMainnet = selectedCluster.network === ClusterNetwork.Mainnet;
  const currentSOLBalance = balance?.sol || 0;

  const handleAirdrop = async () => {
    try {
      await requestAirdrop(1);
    } catch (error) {
      // Error is handled by the wallet context
      console.error('Airdrop failed:', error);
    }
  };

  const resetAirdrop = () => {
    // This will be handled by the next airdrop request
  };

  // Show wallet connection prompt if not connected
  if (!account?.publicKey) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <Link
          href="/dashboard/account"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Account</span>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SOL Airdrop</h1>
          <p className="text-gray-600 mt-1">Request free SOL tokens for transaction fees (Testnet only)</p>
        </div>

        {/* Connect Wallet */}
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Zap className="h-16 w-16 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Connect Your Wallet</h2>
          <p className="text-gray-600 text-center max-w-md">
            Connect your Solana wallet to request SOL airdrops for transaction fees.
          </p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  // Show mainnet warning
  if (isMainnet) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <Link
          href="/dashboard/account"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Account</span>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SOL Airdrop</h1>
          <p className="text-gray-600 mt-1">Request free SOL tokens for transaction fees (Testnet only)</p>
        </div>

        {/* Mainnet Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Mainnet Not Supported</h3>
              <p className="text-sm text-red-700 mt-1">
                Airdrops are only available on testnet/devnet. Please switch to devnet to request SOL airdrops.
                For mainnet SOL, you need to purchase from a cryptocurrency exchange.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard/account"
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Account</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SOL Airdrop</h1>
        <p className="text-gray-600 mt-1">Request free SOL tokens for transaction fees (Testnet only)</p>
      </div>

      {/* Success State */}
      {lastAirdropTx && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h2 className="text-lg font-semibold text-green-900">Airdrop Successful!</h2>
              <p className="text-sm text-green-700">1 SOL has been sent to your wallet</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Transaction Hash</div>
                <div className="font-mono text-sm text-gray-900">{lastAirdropTx}</div>
              </div>
              <a
                href={`https://solscan.io/tx/${lastAirdropTx}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-[#00B49F] hover:text-[#00A08A] transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">View on Solscan</span>
              </a>
            </div>
          </div>

          <button
            onClick={resetAirdrop}
            className="bg-[#00B49F] text-white px-4 py-2 rounded-lg hover:bg-[#00A08A] transition-colors"
          >
            Request Another Airdrop
          </button>
        </div>
      )}

      {/* Main Airdrop Interface */}
      {!lastAirdropTx && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center space-y-6">
            {/* Airdrop Icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>

            {/* Current Balance */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Current SOL Balance</h2>
              <div className="text-3xl font-bold text-gray-900">{currentSOLBalance.toFixed(3)} SOL</div>
              <p className="text-sm text-gray-600 mt-1">≈ ${(currentSOLBalance * 100).toFixed(2)} USD</p>
            </div>

            {/* Airdrop Amount */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Airdrop Amount</div>
              <div className="text-xl font-semibold text-gray-900">1.0 SOL</div>
              <div className="text-sm text-gray-500">Enough for hundreds of transactions</div>
            </div>

            {/* Request Button */}
            <button
              onClick={handleAirdrop}
              disabled={isRequestingAirdrop}
              className="w-full bg-[#00B49F] text-white py-3 rounded-lg hover:bg-[#00A08A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Zap className="h-5 w-5" />
              <span>{isRequestingAirdrop ? 'Requesting Airdrop...' : 'Request 1 SOL Airdrop'}</span>
            </button>

            {/* Error Message */}
            {airdropError && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{airdropError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Wallet Address</span>
            <span className="font-mono text-sm text-gray-900">
              {account.displayAddress}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Network</span>
            <span className="font-medium text-gray-900">
              {selectedCluster.name} ({isMainnet ? 'Mainnet' : 'Testnet/Devnet'})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current SOL Balance</span>
            <span className="font-medium text-gray-900">{currentSOLBalance.toFixed(3)} SOL</span>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What is SOL Airdrop */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What is SOL Airdrop?</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              SOL airdrops provide free Solana tokens that you can use to pay for transaction fees on the Solana blockchain.
            </p>
            <p>
              Each transaction on Solana requires a small amount of SOL (usually less than $0.01) to process.
            </p>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Usage Guidelines</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>• Airdrops are limited to prevent abuse</p>
            <p>• Only available on testnet/devnet</p>
            <p>• Use SOL responsibly for legitimate transactions</p>
            <p>• Keep some SOL for future transaction fees</p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Testnet Only</h3>
            <p className="text-sm text-red-700 mt-1">
              This airdrop feature only works on Solana&apos;s testnet/devnet. These tokens have no real value and cannot be 
              transferred to mainnet. For mainnet SOL, you need to purchase from a cryptocurrency exchange.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}