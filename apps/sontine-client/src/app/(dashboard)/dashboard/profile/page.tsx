'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Send, 
  Download, 
  Gift, 
  Wallet, 
  History, 
  Star, 
  Settings,
  ArrowRight 
} from 'lucide-react';
import { AppText } from '@/components/ui/app-text';
import { SontineCard, SontineCardContent } from '@/components/ui/sontine-card';
import { SontineButton } from '@/components/ui/sontine-button';
import { ProfileHeader } from '@/components/profile/profile-header';

export default function ProfilePage() {
  const router = useRouter();
  
  const menuItems = [
    {
      title: 'Account Overview',
      description: 'View wallet balance and details',
      icon: User,
      route: '/dashboard/account',
      color: '#00B49F',
    },
    {
      title: 'Send USDC',
      description: 'Transfer USDC to other wallets',
      icon: Send,
      route: '/dashboard/account/send',
      color: '#10B981',
    },
    {
      title: 'Receive USDC',
      description: 'Get your wallet address to receive',
      icon: Download,
      route: '/dashboard/account/receive',
      color: '#3B82F6',
    },
    {
      title: 'Request Airdrop',
      description: 'Get test USDC for development',
      icon: Gift,
      route: '/dashboard/account/airdrop',
      color: '#F59E0B',
    },
    {
      title: 'Wallet Management',
      description: 'Advanced wallet features',
      icon: Wallet,
      route: '/dashboard/profile/wallet',
      color: '#00B49F',
    },
    {
      title: 'Transaction History',
      description: 'View all your transactions',
      icon: History,
      route: '/dashboard/profile/history',
      color: '#8B5CF6',
    },
    {
      title: 'Reputation Score',
      description: 'View your reputation details',
      icon: Star,
      route: '/dashboard/profile/reputation',
      color: '#FFD700',
    },
    {
      title: 'Settings',
      description: 'App preferences and security',
      icon: Settings,
      route: '/dashboard/settings',
      color: '#6B7280',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6 -mt-4">
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <SontineCard key={index} variant="elevated" padding="none">
                <SontineCardContent>
                  <SontineButton
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onClick={() => router.push(item.route)}
                    className="justify-start p-0 h-auto"
                  >
                    <div className="flex items-center space-x-4 w-full py-4 px-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <IconComponent size={24} color={item.color} />
                      </div>

                      <div className="flex-1 text-left">
                        <AppText variant="titleSmall" className="text-gray-900 mb-1">
                          {item.title}
                        </AppText>
                        <AppText variant="bodySmall" className="text-gray-600">
                          {item.description}
                        </AppText>
                      </div>

                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  </SontineButton>
                </SontineCardContent>
              </SontineCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}