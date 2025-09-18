'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Calendar, DollarSign, Plus } from 'lucide-react';

export default function TontinesPage() {
  const tontines = [
    {
      id: '1',
      name: 'Family Savings Circle',
      members: 8,
      totalAmount: 4000,
      contributionAmount: 500,
      nextPayout: '2024-01-15',
      status: 'active',
      description: 'Monthly family savings group for emergency fund building',
    },
    {
      id: '2',
      name: 'Friends Investment Group',
      members: 12,
      totalAmount: 12000,
      contributionAmount: 1000,
      nextPayout: '2024-01-22',
      status: 'active',
      description: 'Investment-focused tontine for long-term wealth building',
    },
    {
      id: '3',
      name: 'Community Wealth Building',
      members: 5,
      totalAmount: 2500,
      contributionAmount: 500,
      nextPayout: '2024-02-01',
      status: 'pending',
      description: 'Local community group focused on mutual financial support',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tontines</h1>
          <p className="text-gray-600 mt-1">Manage your tontine memberships and contributions</p>
        </div>
        <Link
          href="/dashboard/tontines/create"
          className="bg-[#00B49F] text-white px-4 py-2 rounded-lg hover:bg-[#00A08A] transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Tontine</span>
        </Link>
      </div>

      {/* Browse Tontines */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Tontines</h2>
          <Link
            href="/dashboard/tontines/browse"
            className="text-[#00B49F] hover:underline text-sm font-medium"
          >
            Browse all →
          </Link>
        </div>
        <p className="text-gray-600 text-sm">
          Discover and join tontines in your community
        </p>
      </div>

      {/* Tontines Grid */}
      <div className="grid gap-6">
        {tontines.map((tontine) => (
          <div key={tontine.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tontine.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{tontine.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tontine.status)}`}>
                {tontine.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{tontine.members} members</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">${tontine.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Next: {new Date(tontine.nextPayout).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">${tontine.contributionAmount}/month</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Your contribution: ${tontine.contributionAmount}
              </div>
              <Link
                href={`/dashboard/tontines/${tontine.id}`}
                className="text-[#00B49F] hover:underline text-sm font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {tontines.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tontines yet</h3>
          <p className="text-gray-600 mb-4">Start by creating your first tontine or joining an existing one.</p>
          <Link
            href="/dashboard/tontines/create"
            className="bg-[#00B49F] text-white px-4 py-2 rounded-lg hover:bg-[#00A08A] transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Your First Tontine</span>
          </Link>
        </div>
      )}
    </div>
  );
}