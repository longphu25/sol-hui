'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { User, Wallet, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { account } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: account?.label || account?.displayAddress || 'User',
    walletAddress: account?.address || '',
    bio: 'Passionate about decentralized finance and community building.',
  });

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      name: account?.label || account?.displayAddress || 'User',
      walletAddress: account?.address || '',
      bio: 'Passionate about decentralized finance and community building.',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your profile information and settings</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#00B49F] text-white px-4 py-2 rounded-lg hover:bg-[#00A08A] transition-colors flex items-center space-x-2"
          >
            <Edit2 size={20} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-[#00B49F] text-white px-4 py-2 rounded-lg hover:bg-[#00A08A] transition-colors flex items-center space-x-2"
            >
              <Save size={20} />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <X size={20} />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-[#00B49F] rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
            <p className="text-gray-600">{profileData.walletAddress}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B49F] focus:border-transparent outline-none"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{profileData.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address (Read-only)
            </label>
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-mono text-sm break-all">{profileData.walletAddress}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B49F] focus:border-transparent outline-none resize-none"
              />
            ) : (
              <p className="text-gray-900">{profileData.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#00B49F]">3</div>
            <div className="text-sm text-gray-600">Active Tontines</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#00B49F]">$2,450</div>
            <div className="text-sm text-gray-600">Total Contributions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#00B49F]">8 months</div>
            <div className="text-sm text-gray-600">Member Since</div>
          </div>
        </div>
      </div>
    </div>
  );
}