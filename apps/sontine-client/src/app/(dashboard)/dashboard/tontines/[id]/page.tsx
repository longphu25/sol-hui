'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, Calendar, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration - in real app, this would come from blockchain
const mockGroupData = {
  groupId: 1001,
  contributionAmount: 100, // USDC
  maxMembers: 10,
  currentMembers: 8,
  currentRound: 3,
  totalRounds: 10,
  status: { active: {} },
  selectionMethod: { auction: {} },
  admin: 'AdminWallet123...',
};

const mockMemberAccount = true; // User is a member

export default function TontineDetailPage() {
  const params = useParams();
  const groupAddress = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'activity'>('overview');
  const [isLoading] = useState(false);

  const groupData = mockGroupData;
  const isUserMember = mockMemberAccount;
  const contributionAmount = groupData.contributionAmount;
  const totalAmount = contributionAmount * groupData.maxMembers;

  // Get status information
  const getStatusInfo = (status: unknown) => {
    if (typeof status === 'object' && status !== null) {
      const statusObj = status as Record<string, unknown>;
      if ('active' in statusObj) {
        return {
          label: 'Active',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          canJoin: false,
          description: 'Group is actively running rounds',
        };
      }
      if ('forming' in statusObj) {
        return {
          label: 'Forming',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: Clock,
          canJoin: true,
          description: 'Group is still accepting new members',
        };
      }
      if ('completed' in statusObj) {
        return {
          label: 'Completed',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: CheckCircle,
          canJoin: false,
          description: 'All rounds have been completed',
        };
      }
    }
    return {
      label: 'Unknown',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: AlertCircle,
      canJoin: false,
      description: 'Status unknown',
    };
  };

  const statusInfo = getStatusInfo(groupData.status);
  const StatusIcon = statusInfo.icon;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-gray-600">Loading group data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard/tontines/browse"
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Browse</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tontine #{groupData.groupId}</h1>
            <p className="text-gray-600 mt-1">Group Address: {groupAddress.slice(0, 8)}...</p>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${statusInfo.bgColor}`}>
            <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
            <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{groupData.currentMembers}</div>
            <div className="text-sm text-gray-600">Current Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Pool</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{groupData.currentRound}</div>
            <div className="text-sm text-gray-600">Current Round</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">${contributionAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Per Round</div>
          </div>
        </div>
      </div>

      {/* Membership Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isUserMember ? (
          <div className="flex items-center justify-center space-x-3 text-[#00B49F]">
            <CheckCircle className="h-6 w-6" />
            <span className="text-lg font-medium">You are a member of this group</span>
          </div>
        ) : statusInfo.canJoin ? (
          <div className="text-center space-y-4">
            <div className="text-gray-900 text-lg font-medium">Join this tontine group</div>
            <button className="bg-[#00B49F] text-white px-6 py-3 rounded-lg hover:bg-[#00A08A] transition-colors">
              Join Group
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-gray-900 text-lg font-medium">Group {statusInfo.label}</div>
            <p className="text-gray-600">{statusInfo.description}</p>
          </div>
        )}
      </div>

      {/* Round Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Round Information</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Round Progress</span>
            <span className="font-medium">
              {groupData.currentRound} of {groupData.totalRounds}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#00B49F] h-2 rounded-full"
              style={{
                width: `${(groupData.currentRound / groupData.totalRounds) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Round {groupData.currentRound}</span>
            <span>{groupData.totalRounds - groupData.currentRound} rounds remaining</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'overview', label: 'Overview', icon: AlertCircle },
            { key: 'members', label: 'Members', icon: Users },
            { key: 'activity', label: 'Activity', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#00B49F] border-b-2 border-[#00B49F]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Organizer</span>
                    <span className="font-medium">{groupData.admin.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contribution Amount</span>
                    <span className="font-medium">${contributionAmount.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Members</span>
                    <span className="font-medium">{groupData.maxMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selection Method</span>
                    <span className="font-medium">
                      {typeof groupData.selectionMethod === 'object' && 'auction' in groupData.selectionMethod
                        ? 'Auction'
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Members ({groupData.currentMembers})</h3>
              <div className="text-gray-600">
                Member list will be available once connected to the blockchain.
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600">
                  Activity history will be available once the group becomes active
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}