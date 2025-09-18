import React from 'react';
import { AppText } from '@/components/ui/app-text';

interface AccountUiBalanceProps {
  address: string;
}

export function AccountUiBalance({ address }: AccountUiBalanceProps) {
  // Mock balance data - in a real app this would use a hook to fetch from Solana
  const mockBalance = 2.45; // SOL
  const isLoading = false;
  
  // In a real app, you'd use the address to fetch the actual balance
  console.log('Fetching balance for address:', address);

  return (
    <div>
      <AppText variant="displayMedium" className="text-white font-bold">
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Loading...
          </div>
        ) : (
          `${mockBalance} SOL`
        )}
      </AppText>
    </div>
  );
}