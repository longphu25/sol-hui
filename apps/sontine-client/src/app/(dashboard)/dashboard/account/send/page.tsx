'use client';

import React, { useState } from 'react';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SendPage() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!recipientAddress.trim()) {
        throw new Error('Please enter a recipient address');
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Simulate sending transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setRecipientAddress('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/account"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Account</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Sent Successfully!</h1>
          <p className="text-gray-600 mb-6">Your transaction has been submitted to the blockchain.</p>
          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="bg-[#00B49F] text-white px-6 py-3 rounded-lg hover:bg-[#00A08A] transition-colors mr-3"
            >
              Send Another
            </button>
            <Link
              href="/dashboard/account"
              className="inline-block px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Account
            </Link>
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
        <h1 className="text-2xl font-bold text-gray-900">Send USDC</h1>
        <p className="text-gray-600 mt-1">Send USDC tokens to another wallet address</p>
      </div>

      {/* Send Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSend} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Enter wallet address (e.g., CKaKwfq1BjKHMHZmzmeZQoWbNFjbyCgHMLunajcm5DEL)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B49F] focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Make sure the address is correct. Transactions cannot be reversed.
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B49F] focus:border-transparent"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                USDC
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Available: 1,250.75 USDC</span>
              <button
                type="button"
                onClick={() => setAmount('1250.75')}
                className="text-[#00B49F] hover:underline"
              >
                Use Max
              </button>
            </div>
          </div>

          {/* Transaction Fee */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Network Fee</span>
              <span className="text-sm font-medium text-gray-900">~0.000005 SOL</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Network fees are paid in SOL and may vary based on network congestion
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !recipientAddress || !amount}
            className="w-full flex items-center justify-center space-x-2 bg-[#00B49F] text-white py-3 rounded-lg hover:bg-[#00A08A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            <span>{isLoading ? 'Sending...' : 'Send USDC'}</span>
          </button>
        </form>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Double-check the recipient address before sending. Transactions on the Solana blockchain are irreversible.
              Make sure you have enough SOL in your wallet to cover the network fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}