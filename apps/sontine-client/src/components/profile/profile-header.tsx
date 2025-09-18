'use client';

import React from 'react';
import { User } from 'lucide-react';
import { AppText } from '@/components/ui/app-text';
import { GradientBackground } from '@/components/ui/gradient-background';
import { useAuth } from '@/components/auth/auth-provider';

// Mock user data
const mockUser = {
  name: 'Leo Pham',
  email: 'hongthaipro@gmail.com',
  walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  totalContributed: 1250.5,
  activeTontines: 3,
  completedCycles: 12,
};

export function ProfileHeader() {
  const { account } = useAuth();

  const ellipsify = (str: string, len: number = 4) => {
    if (str.length <= len * 2) return str;
    return `${str.slice(0, len)}...${str.slice(-len)}`;
  };

  // Get wallet address from connected account
  const walletAddress = account?.address || '';
  const displayAddress = walletAddress ? ellipsify(walletAddress, 8) : 'No wallet connected';

  return (
    <GradientBackground variant="primary-accent" className="relative">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            {/* Welcome text */}
            <AppText variant="titleMedium" className="text-white/90 mb-2">
              Welcome user! 👋
            </AppText>

            {/* User info */}
            <div>
              <AppText variant="headlineMedium" className="text-white font-bold mb-1">
                {mockUser.name}
              </AppText>
              <AppText variant="bodyMedium" className="text-white/80 font-mono">
                {displayAddress}
              </AppText>
            </div>
          </div>

          <div className="ml-4">
            {/* Profile icon */}
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-between items-center">
          <div className="text-center">
            <AppText variant="headlineSmall" className="text-white font-bold mb-1">
              {mockUser.totalContributed} USDC
            </AppText>
            <AppText variant="labelMedium" className="text-white/80">
              Total Contributed
            </AppText>
          </div>

          <div className="text-center">
            <AppText variant="headlineSmall" className="text-white font-bold mb-1">
              {mockUser.activeTontines}
            </AppText>
            <AppText variant="labelMedium" className="text-white/80">
              Active Tontines
            </AppText>
          </div>

          <div className="text-center">
            <AppText variant="headlineSmall" className="text-white font-bold mb-1">
              {mockUser.completedCycles}
            </AppText>
            <AppText variant="labelMedium" className="text-white/80">
              Completed Cycles
            </AppText>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}