'use client';

import React from 'react';
import { AppText } from '@/components/ui/app-text';
import { SontineButton } from '@/components/ui/sontine-button';
import { useAuth } from '@/components/auth/auth-provider';

export function SettingsUiAccount() {
  const { account, signOut, signIn } = useAuth();

  const ellipsify = (str: string, len: number = 4) => {
    if (str.length <= len * 2) return str;
    return `${str.slice(0, len)}...${str.slice(-len)}`;
  };

  return (
    <div className="space-y-4">
      <AppText variant="bodyMedium" className="text-gray-700">
        {account ? 
          `Connected to ${ellipsify(account.address || '', 8)}` : 
          'Connect your wallet to get started.'
        }
      </AppText>
      
      <div className="flex justify-end">
        {account ? (
          <SontineButton
            variant="outline"
            size="md"
            onClick={signOut}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Disconnect Wallet
          </SontineButton>
        ) : (
          <SontineButton
            variant="primary"
            size="md"
            onClick={signIn}
          >
            Connect Wallet
          </SontineButton>
        )}
      </div>
    </div>
  );
}