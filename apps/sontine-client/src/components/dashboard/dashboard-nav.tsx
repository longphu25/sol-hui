'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Home, Users, Wallet, User, Settings, LogOut } from 'lucide-react';

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
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-[#00B49F]">
              Sontine
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'text-[#00B49F] bg-[#00B49F]/10'
                    : 'text-gray-600 hover:text-[#00B49F] hover:bg-[#00B49F]/5'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {account?.displayAddress || account?.address}
            </span>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center py-2 px-3 text-xs ${
                  isActive(href)
                    ? 'text-[#00B49F]'
                    : 'text-gray-600'
                }`}
              >
                <Icon size={20} />
                <span className="mt-1">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}