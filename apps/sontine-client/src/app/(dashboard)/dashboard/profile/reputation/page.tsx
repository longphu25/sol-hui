'use client';

import React from 'react';
import { Star, Check, CheckCircle } from 'lucide-react';
import { AppText } from '@/components/ui/app-text';
import { SontineCard, SontineCardContent } from '@/components/ui/sontine-card';
import { GradientBackground } from '@/components/ui/gradient-background';

// Mock reputation data
const mockReputation = {
  score: 4.6,
  maxScore: 5.0,
  level: 'Trusted Member',
  totalTransactions: 47,
  successRate: 98.5,
  onTimePayments: 46,
  completedTontines: 8,
  achievements: [
    { id: '1', title: 'Early Adopter', description: 'One of the first 1000 users', icon: Star, earned: true },
    {
      id: '2',
      title: 'Reliable Member',
      description: '100% on-time payments',
      icon: CheckCircle,
      earned: true,
    },
    { id: '3', title: 'Community Builder', description: 'Created 5+ tontines', icon: Star, earned: false },
    {
      id: '4',
      title: 'High Roller',
      description: 'Participated in 1000+ SOL tontines',
      icon: Star,
      earned: false,
    },
  ],
  reputationHistory: [
    { date: '2024-01-15', score: 4.6, change: +0.1, reason: 'Successful payout completion' },
    { date: '2024-01-01', score: 4.5, change: +0.2, reason: 'Consistent contributions' },
    { date: '2023-12-15', score: 4.3, change: +0.1, reason: 'Positive member feedback' },
  ],
};

export default function ReputationPage() {
  const getStarColor = (index: number) => {
    const fullStars = Math.floor(mockReputation.score);
    const hasHalfStar = mockReputation.score % 1 >= 0.5;

    if (index < fullStars) {
      return '#FFD700';
    } else if (index === fullStars && hasHalfStar) {
      return '#FFD700';
    } else {
      return '#D1D5DB';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GradientBackground variant="navy-primary" className="py-8">
        <div className="container mx-auto px-4">
          <AppText variant="displaySmall" className="text-white text-center mb-2">
            Reputation Score
          </AppText>
          <AppText variant="bodyLarge" className="text-white/90 text-center">
            Your trustworthiness score based on transaction history
          </AppText>
        </div>
      </GradientBackground>

      <div className="container mx-auto px-4 py-6 -mt-4">
        {/* Reputation Score */}
        <SontineCard variant="elevated" padding="lg" className="mb-6">
          <SontineCardContent>
            <div className="text-center mb-6">
              <AppText variant="displayMedium" className="text-gray-900 mb-4 font-bold">
                {mockReputation.score}
              </AppText>

              <div className="flex items-center justify-center mb-4">
                {[0, 1, 2, 3, 4].map((index) => (
                  <Star
                    key={index}
                    size={24}
                    className={`ml-1 ${index === 0 ? 'ml-0' : ''}`}
                    color={getStarColor(index)}
                    fill={getStarColor(index)}
                  />
                ))}
              </div>

              <AppText variant="titleMedium" className="text-[#00B49F] mb-2 font-medium">
                {mockReputation.level}
              </AppText>

              <AppText variant="bodyMedium" className="text-gray-600 text-center">
                Based on {mockReputation.totalTransactions} transactions with {mockReputation.successRate}% success rate
              </AppText>
            </div>
          </SontineCardContent>
        </SontineCard>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <SontineCard variant="outlined" padding="md">
            <SontineCardContent>
              <AppText variant="titleMedium" className="text-gray-900 mb-1 font-bold">
                {mockReputation.onTimePayments}
              </AppText>
              <AppText variant="bodySmall" className="text-gray-600">
                On-time Payments
              </AppText>
            </SontineCardContent>
          </SontineCard>

          <SontineCard variant="outlined" padding="md">
            <SontineCardContent>
              <AppText variant="titleMedium" className="text-gray-900 mb-1 font-bold">
                {mockReputation.completedTontines}
              </AppText>
              <AppText variant="bodySmall" className="text-gray-600">
                Completed Tontines
              </AppText>
            </SontineCardContent>
          </SontineCard>
        </div>

        {/* Achievements */}
        <AppText variant="titleMedium" className="text-gray-900 mb-4 font-medium">
          Achievements
        </AppText>

        <div className="space-y-3 mb-8">
          {mockReputation.achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <SontineCard
                key={achievement.id}
                variant="default"
                padding="md"
                className={achievement.earned ? '' : 'opacity-50'}
              >
                <SontineCardContent>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}
                    >
                      <IconComponent
                        size={24}
                        color={achievement.earned ? '#FFD700' : '#9CA3AF'}
                      />
                    </div>

                    <div className="flex-1">
                      <AppText variant="titleSmall" className="text-gray-900 mb-1">
                        {achievement.title}
                      </AppText>
                      <AppText variant="bodySmall" className="text-gray-600">
                        {achievement.description}
                      </AppText>
                    </div>

                    {achievement.earned && (
                      <Check size={20} className="text-green-500" />
                    )}
                  </div>
                </SontineCardContent>
              </SontineCard>
            );
          })}
        </div>

        {/* Reputation History */}
        <AppText variant="titleMedium" className="text-gray-900 mb-4 font-medium">
          Recent Changes
        </AppText>

        <div className="space-y-3">
          {mockReputation.reputationHistory.map((entry, index) => (
            <SontineCard key={index} variant="default" padding="md">
              <SontineCardContent>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <AppText variant="titleSmall" className="text-gray-900 mb-1">
                      {entry.reason}
                    </AppText>
                    <AppText variant="bodySmall" className="text-gray-500">
                      {entry.date}
                    </AppText>
                  </div>

                  <div className="text-right">
                    <AppText
                      variant="titleSmall"
                      className={entry.change > 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {entry.change > 0 ? '+' : ''}
                      {entry.change}
                    </AppText>
                    <AppText variant="bodySmall" className="text-gray-500">
                      Score: {entry.score}
                    </AppText>
                  </div>
                </div>
              </SontineCardContent>
            </SontineCard>
          ))}
        </div>
      </div>
    </div>
  );
}