'use client';

import React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { account } = useAuth();

  const stats = [
    {
      title: 'Active Tontines',
      value: '3',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Contributions',
      value: '$2,450',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Next Payout',
      value: '5 days',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'ROI',
      value: '+12.5%',
      icon: TrendingUp,
      color: 'text-[#00B49F]',
      bgColor: 'bg-[#00B49F]/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {account?.label || account?.displayAddress || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your tontine activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                type: 'contribution',
                description: 'Made contribution to Family Savings Circle',
                amount: '$500',
                time: '2 hours ago',
              },
              {
                type: 'payout',
                description: 'Received payout from Friends Investment Group',
                amount: '$2,000',
                time: '1 day ago',
              },
              {
                type: 'joined',
                description: 'Joined Community Wealth Building',
                amount: '',
                time: '3 days ago',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                {activity.amount && (
                  <span className={`text-sm font-semibold ${
                    activity.type === 'payout' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {activity.type === 'payout' ? '+' : '-'}{activity.amount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}