'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AppConfig } from '@/constants/app-config';
import { Wallet, Shield, Zap, Users } from 'lucide-react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { connected } = useWallet();
  const router = useRouter();
  const hasAttemptedAutoSign = React.useRef(false);

  const handleSignIn = React.useCallback(async () => {
    if (!connected || isLoading) {
      // The wallet connection will be handled by WalletMultiButton
      return;
    }

    setIsLoading(true);
    try {
      await signIn();
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connected, isLoading, signIn, router]);

  // Auto sign-in when wallet is connected
  React.useEffect(() => {
    if (!connected) {
      hasAttemptedAutoSign.current = false;
      return;
    }

    if (hasAttemptedAutoSign.current) return;

    hasAttemptedAutoSign.current = true;
    void handleSignIn();
  }, [connected, handleSignIn]);

  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Built on Solana blockchain for maximum security and transparency',
    },
    {
      icon: Zap,
      title: 'Fast Transactions',
      description: 'Lightning-fast transactions with low fees on Solana network',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join tontine groups with friends, family, or community members',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#00B49F] rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to {AppConfig.appName}</h1>
        <p className="text-gray-600">{AppConfig.tagline}</p>
      </div>

      <div className="space-y-6 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[#00B49F]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <feature.icon className="w-4 h-4 text-[#00B49F]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">{feature.title}</h3>
              <p className="text-gray-600 text-xs">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="wallet-adapter-button-wrapper">
          <WalletMultiButton className="!w-full !bg-[#00B49F] hover:!bg-[#00A08A] !rounded-lg !h-12 !text-base !font-medium" />
        </div>
        
        {connected && (
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00B49F] to-[#00A08A] text-white py-3 px-4 rounded-lg font-medium hover:from-[#00A08A] hover:to-[#009688] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In to Sontine'
            )}
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By connecting your wallet, you agree to our{' '}
          <a href="#" className="text-[#00B49F] hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#00B49F] hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
