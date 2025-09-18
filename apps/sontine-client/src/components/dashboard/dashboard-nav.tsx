'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { Home, Users, Wallet, User, Settings, LogOut } from 'lucide-react';
import { AppText } from '@/components/ui/app-text';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/tontines', label: 'Tontines', icon: Users },
  { href: '/dashboard/account', label: 'Account', icon: Wallet },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { signOut, account } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image src="/images/icon.png" alt="Sontine Logo" width={32} height={32} className="w-full h-full object-contain" />
              <AppText variant="headlineSmall" className="text-[#00B49F] font-bold">
                Sontine
              </AppText>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(href)
                    ? 'text-white bg-gradient-to-r from-[#00B49F] to-[#00A08A] shadow-md'
                    : 'text-gray-600 hover:text-[#00B49F] hover:bg-[#00B49F]/10'
                }`}
              >
                <Icon size={18} />
                <AppText variant="labelLarge" className="text-inherit">
                  {label}
                </AppText>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <AppText variant="labelMedium" className="text-gray-600">
                {account?.displayAddress || account?.address}
              </AppText>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200/50">
          <div className="flex justify-around py-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive(href)
                    ? 'text-[#00B49F] bg-[#00B49F]/10'
                    : 'text-gray-600 hover:text-[#00B49F]'
                }`}
              >
                <Icon size={20} />
                <AppText variant="labelSmall" className="mt-1 text-inherit">
                  {label}
                </AppText>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}