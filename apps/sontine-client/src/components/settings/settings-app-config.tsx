'use client';

import React from 'react';
import { AppText } from '@/components/ui/app-text';
import { ExternalLink } from 'lucide-react';

// Mock app config - in a real app this would come from a config file
const AppConfig = {
  name: 'Sontine',
  version: '1.0.0',
  uri: 'https://sontine.app',
  description: 'Decentralized Tontine Platform on Solana',
  author: 'Sontine Team',
};

export function SettingsAppConfig() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <AppText variant="labelMedium" className="text-gray-700 mb-1">
            App Name
          </AppText>
          <AppText variant="bodyMedium" className="text-gray-900 font-medium">
            {AppConfig.name}
          </AppText>
        </div>

        <div>
          <AppText variant="labelMedium" className="text-gray-700 mb-1">
            Version
          </AppText>
          <AppText variant="bodyMedium" className="text-gray-900 font-medium">
            {AppConfig.version}
          </AppText>
        </div>

        <div>
          <AppText variant="labelMedium" className="text-gray-700 mb-1">
            Author
          </AppText>
          <AppText variant="bodyMedium" className="text-gray-900 font-medium">
            {AppConfig.author}
          </AppText>
        </div>

        <div>
          <AppText variant="labelMedium" className="text-gray-700 mb-1">
            Website
          </AppText>
          <a 
            href={AppConfig.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-[#00B49F] hover:text-[#00A08A] transition-colors"
          >
            <AppText variant="bodyMedium" className="text-inherit">
              {AppConfig.uri}
            </AppText>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div>
        <AppText variant="labelMedium" className="text-gray-700 mb-2">
          Description
        </AppText>
        <AppText variant="bodyMedium" className="text-gray-900">
          {AppConfig.description}
        </AppText>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <AppText variant="labelSmall" className="text-gray-600 mb-2">
          Environment Information
        </AppText>
        <div className="space-y-1 text-xs text-gray-500">
          <div>Build: {process.env.NODE_ENV || 'development'}</div>
          <div>Platform: Web</div>
          <div>Framework: Next.js</div>
        </div>
      </div>
    </div>
  );
}