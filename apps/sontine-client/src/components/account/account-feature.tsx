import React, { useState } from 'react';
import { RefreshCw, Copy } from 'lucide-react';
import { AppText } from '@/components/ui/app-text';
import { SontineButton } from '@/components/ui/sontine-button';
import { GradientBackground } from '@/components/ui/gradient-background';
import { AccountUiBalance } from './account-ui-balance';
import { AccountUiButtons } from './account-ui-buttons';
import { AccountUiTokenAccounts } from './account-ui-token-accounts';

interface AccountFeatureProps {
  address?: string;
  connected?: boolean;
}

export function AccountFeature({ address, connected = true }: AccountFeatureProps) {
  const [refreshing, setRefreshing] = useState(false);

  const mockAddress = address || '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

  const ellipsify = (str: string, len: number = 4) => {
    if (str.length > 30) {
      return `${str.substring(0, len)}...${str.substring(str.length - len, str.length)}`;
    }
    return str;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(mockAddress);
    // In a real app, you'd show a toast notification here
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <div className="text-center">
          <AppText variant="titleMedium" className="text-gray-900 mb-4">
            Connect your wallet.
          </AppText>
          <SontineButton variant="primary" size="lg">
            Connect Wallet
          </SontineButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GradientBackground variant="navy-primary" className="py-8">
        <div className="container mx-auto px-4">
          {/* Balance Section */}
          <div className="text-center mb-6">
            <AccountUiBalance address={mockAddress} />
            
            {/* Address */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <AppText variant="bodyMedium" className="text-white/80">
                {ellipsify(mockAddress, 8)}
              </AppText>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Copy size={16} className="text-white/80" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <AccountUiButtons />
        </div>
      </GradientBackground>

      <div className="container mx-auto px-4 py-6 -mt-4">
        {/* Refresh Button */}
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <SontineButton
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="text-gray-600"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </SontineButton>
        </div>

        {/* Token Accounts */}
        <AccountUiTokenAccounts address={mockAddress} />
      </div>
    </div>
  );
}