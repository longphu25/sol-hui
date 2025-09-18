'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Info } from 'lucide-react';
import { SontineCard, SontineCardContent } from '@/components/ui/sontine-card';
import { SontineButton, SontineActionButton } from '@/components/ui/sontine-button';
import { SontineInput } from '@/components/ui/sontine-input';
import { AppText } from '@/components/ui/app-text';
import { GradientBackground } from '@/components/ui/gradient-background';

// Helper types from mobile app
type SelectionMethod = { fixedOrder: object } | { random: object } | { auction: object };
type CycleDuration = { weekly: object } | { monthly: object } | { custom: { duration: number } };

interface AuctionConfig {
  auctionDuration: number;
  minBidIncrement: number;
  maxInterestRate: number;
}

// Helper functions to create proper enum values
const createSelectionMethod = (method: 'fixedOrder' | 'random' | 'auction'): SelectionMethod => {
  return { [method]: {} } as SelectionMethod;
};

const createCycleDuration = (duration: 'weekly' | 'monthly' | 'custom', customDays?: number): CycleDuration => {
  if (duration === 'custom' && customDays) {
    return { custom: { duration: customDays } } as CycleDuration;
  }
  return { [duration]: {} } as CycleDuration;
};

export default function CreateGroupPage() {
  const [formData, setFormData] = useState({
    contributionAmount: '100',
    maxMembers: '10',
    minMembersToStart: '5',
    selectionMethod: 'fixedOrder' as 'fixedOrder' | 'random' | 'auction',
    cycleDuration: 'monthly' as 'weekly' | 'monthly' | 'custom',
    customDurationDays: '',
    // Auction config (only used when selectionMethod is 'auction')
    auctionDuration: '86400', // 24 hours in seconds
    minBidIncrement: '100', // 1% in basis points
    maxInterestRate: '2000', // 20% in basis points
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.contributionAmount || parseFloat(formData.contributionAmount) <= 0) {
      newErrors.contributionAmount = 'Valid contribution amount is required (in USDC)';
    }

    const maxMembers = parseInt(formData.maxMembers);
    if (!maxMembers || maxMembers < 2 || maxMembers > 255) {
      newErrors.maxMembers = 'Max members must be between 2 and 255';
    }

    const minMembers = parseInt(formData.minMembersToStart);
    if (!minMembers || minMembers < 2 || minMembers > maxMembers) {
      newErrors.minMembersToStart = `Min members must be between 2 and ${maxMembers}`;
    }

    if (formData.cycleDuration === 'custom') {
      const customDays = parseInt(formData.customDurationDays);
      if (!customDays || customDays < 1) {
        newErrors.customDurationDays = 'Custom duration must be at least 1 day';
      }
    }

    if (formData.selectionMethod === 'auction') {
      const auctionDuration = parseInt(formData.auctionDuration);
      if (!auctionDuration || auctionDuration < 3600) {
        newErrors.auctionDuration = 'Auction duration must be at least 1 hour (3600 seconds)';
      }

      const minBidIncrement = parseInt(formData.minBidIncrement);
      if (!minBidIncrement || minBidIncrement < 1 || minBidIncrement > 10000) {
        newErrors.minBidIncrement = 'Min bid increment must be between 0.01% and 100%';
      }

      const maxInterestRate = parseInt(formData.maxInterestRate);
      if (!maxInterestRate || maxInterestRate < 100 || maxInterestRate > 10000) {
        newErrors.maxInterestRate = 'Max interest rate must be between 1% and 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      const contributionAmountInLamports = Math.floor(parseFloat(formData.contributionAmount));

      let cycleDuration: CycleDuration;
      if (formData.cycleDuration === 'custom') {
        cycleDuration = createCycleDuration('custom', parseInt(formData.customDurationDays));
      } else {
        cycleDuration = createCycleDuration(formData.cycleDuration);
      }

      let auctionConfig: AuctionConfig | null = null;
      if (formData.selectionMethod === 'auction') {
        auctionConfig = {
          auctionDuration: parseInt(formData.auctionDuration),
          minBidIncrement: parseInt(formData.minBidIncrement),
          maxInterestRate: parseInt(formData.maxInterestRate),
        };
      }

      // Mock API call - replace with actual blockchain integration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real app, this would call the blockchain
      console.log('Creating group with:', {
        selectionMethod: createSelectionMethod(formData.selectionMethod),
        maxMembers: parseInt(formData.maxMembers),
        contributionAmount: contributionAmountInLamports,
        cycleDuration,
        minMembersToStart: parseInt(formData.minMembersToStart),
        auctionConfig,
      });

      alert('Tontine group created successfully!');
      // In real app: router.push('/dashboard/tontines');
      
    } catch (error) {
      console.error('Create group error:', error);
      alert('Failed to create tontine group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GradientBackground variant="primary-accent" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/dashboard/tontines"
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Tontines</span>
            </Link>
          </div>

          <div className="text-center text-white mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Plus className="h-8 w-8" />
            </div>
            <AppText variant="displaySmall" className="text-white mb-2">
              Create Tontine Group
            </AppText>
            <AppText variant="bodyLarge" className="text-white/90 max-w-2xl mx-auto">
              Set up a new tontine group with customizable parameters for your community
            </AppText>
          </div>
        </div>
      </GradientBackground>

      <div className="container mx-auto px-4 -mt-8 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Basic Configuration */}
          <SontineCard variant="elevated" padding="lg">
            <SontineCardContent>
              <AppText variant="titleMedium" className="mb-4">
                Basic Configuration
              </AppText>

              <div className="space-y-6">
                <SontineInput
                  label="Contribution Amount (USDC)"
                  placeholder="100"
                  value={formData.contributionAmount}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, contributionAmount: text }))}
                  type="number"
                  error={!!errors.contributionAmount}
                  helperText={errors.contributionAmount}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SontineInput
                    label="Max Members"
                    placeholder="10"
                    value={formData.maxMembers}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, maxMembers: text }))}
                    type="number"
                    error={!!errors.maxMembers}
                    helperText={errors.maxMembers}
                  />

                  <SontineInput
                    label="Min to Start"
                    placeholder="5"
                    value={formData.minMembersToStart}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, minMembersToStart: text }))}
                    type="number"
                    error={!!errors.minMembersToStart}
                    helperText={errors.minMembersToStart}
                  />
                </div>
              </div>
            </SontineCardContent>
          </SontineCard>

          {/* Selection Method & Cycle Duration */}
          <SontineCard variant="elevated" padding="lg">
            <SontineCardContent>
              <AppText variant="titleMedium" className="mb-2">
                Selection Method
              </AppText>
              <AppText variant="bodyMedium" className="text-gray-600 mb-6">
                How should recipients be chosen each round?
              </AppText>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <SontineButton
                  variant={formData.selectionMethod === 'random' ? 'primary' : 'outline'}
                  onClick={() => setFormData((prev) => ({ ...prev, selectionMethod: 'random' }))}
                  fullWidth
                >
                  Random
                </SontineButton>
                <SontineButton
                  variant={formData.selectionMethod === 'fixedOrder' ? 'primary' : 'outline'}
                  onClick={() => setFormData((prev) => ({ ...prev, selectionMethod: 'fixedOrder' }))}
                  fullWidth
                >
                  Fixed Order
                </SontineButton>
                <SontineButton
                  variant={formData.selectionMethod === 'auction' ? 'primary' : 'outline'}
                  onClick={() => setFormData((prev) => ({ ...prev, selectionMethod: 'auction' }))}
                  fullWidth
                >
                  Auction
                </SontineButton>
              </div>

              {/* Auction Configuration */}
              {formData.selectionMethod === 'auction' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <AppText variant="titleSmall" className="mb-4 text-blue-900">
                    Auction Configuration
                  </AppText>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SontineInput
                        label="Duration (hours)"
                        placeholder="24"
                        value={formData.auctionDuration ? String(Math.floor(parseInt(formData.auctionDuration) / 3600)) : ''}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, auctionDuration: String(parseInt(text || '0') * 3600) }))
                        }
                        type="number"
                        error={!!errors.auctionDuration}
                        helperText={errors.auctionDuration}
                      />

                      <SontineInput
                        label="Min Bid (%)"
                        placeholder="1"
                        value={formData.minBidIncrement ? String(parseInt(formData.minBidIncrement) / 100) : ''}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, minBidIncrement: String(parseFloat(text || '0') * 100) }))
                        }
                        type="number"
                        error={!!errors.minBidIncrement}
                        helperText={errors.minBidIncrement}
                      />
                    </div>

                    <SontineInput
                      label="Max Interest Rate (%)"
                      placeholder="20"
                      value={formData.maxInterestRate ? String(parseInt(formData.maxInterestRate) / 100) : ''}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, maxInterestRate: String(parseFloat(text || '0') * 100) }))
                      }
                      type="number"
                      error={!!errors.maxInterestRate}
                      helperText={errors.maxInterestRate}
                    />
                  </div>
                </div>
              )}

              {/* Cycle Duration */}
              <AppText variant="titleMedium" className="mb-2">
                Cycle Duration
              </AppText>
              <AppText variant="bodyMedium" className="text-gray-600 mb-6">
                How often should rounds occur?
              </AppText>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SontineButton
                  variant={formData.cycleDuration === 'weekly' ? 'primary' : 'outline'}
                  onClick={() => setFormData((prev) => ({ ...prev, cycleDuration: 'weekly' }))}
                  fullWidth
                >
                  Weekly
                </SontineButton>
                <SontineButton
                  variant={formData.cycleDuration === 'monthly' ? 'primary' : 'outline'}
                  onClick={() => setFormData((prev) => ({ ...prev, cycleDuration: 'monthly' }))}
                  fullWidth
                >
                  Monthly
                </SontineButton>
              </div>
            </SontineCardContent>
          </SontineCard>

          {/* Summary */}
          <SontineCard variant="outlined" padding="lg">
            <SontineCardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Info className="h-5 w-5 text-blue-500" />
                <AppText variant="titleMedium">Summary</AppText>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <AppText variant="bodyMedium" className="text-gray-600">
                    Contribution Amount
                  </AppText>
                  <AppText variant="titleSmall" className="text-[#00B49F]">
                    {formData.contributionAmount || '0'} USDC
                  </AppText>
                </div>

                <div className="flex justify-between items-center">
                  <AppText variant="bodyMedium" className="text-gray-600">
                    Members (Max / Min to Start)
                  </AppText>
                  <AppText variant="bodyMedium">
                    {formData.maxMembers || '0'} / {formData.minMembersToStart || '0'}
                  </AppText>
                </div>

                <div className="flex justify-between items-center">
                  <AppText variant="bodyMedium" className="text-gray-600">
                    Total Pool Value
                  </AppText>
                  <AppText variant="titleSmall" className="text-[#00B49F]">
                    {formData.contributionAmount && formData.maxMembers
                      ? `${parseFloat(formData.contributionAmount) * parseInt(formData.maxMembers)} USDC`
                      : '0 USDC'}
                  </AppText>
                </div>

                <div className="flex justify-between items-center">
                  <AppText variant="bodyMedium" className="text-gray-600">
                    Selection Method
                  </AppText>
                  <AppText variant="bodyMedium">
                    {formData.selectionMethod.charAt(0).toUpperCase() + formData.selectionMethod.slice(1)}
                  </AppText>
                </div>

                <div className="flex justify-between items-center">
                  <AppText variant="bodyMedium" className="text-gray-600">
                    Cycle Duration
                  </AppText>
                  <AppText variant="bodyMedium">
                    {formData.cycleDuration === 'custom'
                      ? `${formData.customDurationDays || '0'} days`
                      : formData.cycleDuration.charAt(0).toUpperCase() + formData.cycleDuration.slice(1)}
                  </AppText>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <AppText variant="bodyMedium" className="text-gray-600">
                    Estimated Duration
                  </AppText>
                  <AppText variant="bodyMedium">
                    {(() => {
                      const maxMembers = parseInt(formData.maxMembers) || 0;
                      if (maxMembers === 0) return 'N/A';

                      let cycleDays = 0;
                      if (formData.cycleDuration === 'weekly') cycleDays = 7;
                      else if (formData.cycleDuration === 'monthly') cycleDays = 30;
                      else if (formData.cycleDuration === 'custom') cycleDays = parseInt(formData.customDurationDays) || 0;

                      const totalDays = maxMembers * cycleDays;
                      if (totalDays === 0) return 'N/A';

                      if (totalDays < 30) return `${totalDays} days`;
                      else if (totalDays < 365) return `${Math.round(totalDays / 30)} months`;
                      else return `${Math.round(totalDays / 365)} years`;
                    })()}
                  </AppText>
                </div>
              </div>
            </SontineCardContent>
          </SontineCard>

          {/* Create Button */}
          <SontineActionButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleCreate}
            isLoading={isCreating}
            loadingText="Creating Tontine..."
            className="text-lg py-4"
          >
            Create Tontine Group
          </SontineActionButton>
        </div>
      </div>
    </div>
  );
}