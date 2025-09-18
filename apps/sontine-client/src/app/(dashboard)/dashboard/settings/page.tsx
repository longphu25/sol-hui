'use client';

import React from 'react';
import { Settings, User, Network, Bug, ArrowRight } from 'lucide-react';
import { AppText } from '@/components/ui/app-text';
import { SontineCard, SontineCardContent, SontineCardHeader } from '@/components/ui/sontine-card';
import { SontineButton } from '@/components/ui/sontine-button';
import { SettingsAppConfig } from '@/components/settings/settings-app-config';
import { SettingsUiAccount } from '@/components/settings/settings-ui-account';
import { SettingsUiCluster } from '@/components/settings/settings-ui-cluster';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'Account & Wallet',
      description: 'Manage your wallet connection and account settings',
      icon: User,
      color: '#00B49F',
      component: <SettingsUiAccount />,
    },
    {
      title: 'App Configuration',
      description: 'Configure app preferences and behavior',
      icon: Settings,
      color: '#6366F1',
      component: <SettingsAppConfig />,
    },
    {
      title: 'Network & Cluster',
      description: 'Select Solana network and RPC endpoint',
      icon: Network,
      color: '#8B5CF6',
      component: <SettingsUiCluster />,
    },
  ];

  const developerTools = [
    {
      title: 'Demo & Testing',
      description: 'Access development tools and component demos',
      icon: Bug,
      color: '#F59E0B',
      href: '/dashboard/settings/demo',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <AppText variant="displaySmall" className="text-gray-900 mb-2">
          Settings
        </AppText>
        <AppText variant="bodyLarge" className="text-gray-600">
          Configure your account, app preferences, and network settings
        </AppText>
      </div>

      <div className="space-y-6">
        {/* Settings Sections */}
        {settingsSections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <SontineCard key={index} variant="elevated" padding="none">
              {/* Section Header */}
              <SontineCardHeader className="flex flex-row items-center space-x-4 p-6 pb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${section.color}20` }}
                >
                  <IconComponent size={24} color={section.color} />
                </div>
                <div className="flex-1">
                  <AppText variant="titleMedium" className="text-gray-900 mb-1">
                    {section.title}
                  </AppText>
                  <AppText variant="bodyMedium" className="text-gray-600">
                    {section.description}
                  </AppText>
                </div>
              </SontineCardHeader>

              {/* Section Content */}
              <SontineCardContent className="px-6 pb-6">
                {section.component}
              </SontineCardContent>
            </SontineCard>
          );
        })}

        {/* Developer Tools Section */}
        <div className="mt-12">
          <AppText variant="titleLarge" className="text-gray-900 mb-6">
            Developer Tools
          </AppText>

          {developerTools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <SontineCard key={index} variant="elevated" padding="md">
                <SontineButton
                  variant="ghost"
                  size="lg"
                  fullWidth
                  onClick={() => window.location.href = tool.href}
                  className="justify-start p-0 h-auto"
                >
                  <div className="flex items-center space-x-4 w-full py-2">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${tool.color}20` }}
                    >
                      <IconComponent size={24} color={tool.color} />
                    </div>

                    <div className="flex-1 text-left">
                      <AppText variant="titleSmall" className="text-gray-900 mb-1">
                        {tool.title}
                      </AppText>
                      <AppText variant="bodySmall" className="text-gray-600">
                        {tool.description}
                      </AppText>
                    </div>

                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </SontineButton>
              </SontineCard>
            );
          })}
        </div>

        {/* Footer Info */}
        <SontineCard variant="outlined" padding="md" className="mt-12">
          <AppText variant="bodySmall" className="text-gray-500 text-center leading-6">
            Configure app info and clusters in{' '}
            <span className="text-[#00B49F] font-medium">constants/app-config.tsx</span>
          </AppText>
        </SontineCard>
      </div>
    </div>
  );
}