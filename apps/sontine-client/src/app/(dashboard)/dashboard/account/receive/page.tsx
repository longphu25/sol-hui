'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, Copy, QrCode, Share } from 'lucide-react';
import Link from 'next/link';

export default function ReceivePage() {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock wallet address
  const walletAddress = 'CKaKwfq1BjKHMHZmzmeZQoWbNFjbyCgHMLunajcm5DEL';

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wallet Address',
          text: 'Send USDC to this address:',
          url: walletAddress,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback to copy
      copyAddress();
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Receive USDC</h1>
        <p className="text-gray-600 mt-1">Share your wallet address to receive USDC tokens</p>
      </div>

      {/* Receive Options */}
      <div className="grid gap-6">
        {/* Wallet Address Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-[#00B49F] p-2 rounded-lg">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Wallet Address</h2>
              <p className="text-sm text-gray-600">Share this address to receive USDC</p>
            </div>
          </div>

          {/* Address Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="font-mono text-sm text-gray-900 break-all">
              {walletAddress}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={copyAddress}
              className="flex items-center justify-center space-x-2 bg-[#00B49F] text-white px-4 py-3 rounded-lg hover:bg-[#00A08A] transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>
            
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-center space-x-2 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <QrCode className="h-4 w-4" />
              <span>{showQR ? 'Hide QR Code' : 'Show QR Code'}</span>
            </button>

            <button
              onClick={shareAddress}
              className="flex items-center justify-center space-x-2 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* QR Code Display */}
        {showQR && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              {/* In a real app, you'd use a QR code library like qrcode.js */}
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-2" />
                  <div className="text-sm">QR Code would appear here</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Scan this QR code with a compatible wallet to send USDC to your address
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Receive USDC</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">1</div>
              <div>Share your wallet address with the sender using one of the methods above</div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">2</div>
              <div>Wait for the sender to initiate the transfer from their wallet</div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">3</div>
              <div>The USDC will appear in your wallet once the transaction is confirmed on the blockchain</div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="text-yellow-600">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Only share your wallet address with trusted sources. Never share your private key or seed phrase with anyone.
                Your address is safe to share publicly, but be cautious of phishing attempts.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Tokens */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Tokens</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                USDC
              </div>
              <div>
                <div className="font-medium text-gray-900">USD Coin</div>
                <div className="text-sm text-gray-600">Primary token for tontines</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                SOL
              </div>
              <div>
                <div className="font-medium text-gray-900">Solana</div>
                <div className="text-sm text-gray-600">For transaction fees</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}