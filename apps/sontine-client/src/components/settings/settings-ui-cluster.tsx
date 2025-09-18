'use client';

import React, { useState } from 'react';
import { AppText } from '@/components/ui/app-text';
import { SontineInput } from '@/components/ui/sontine-input';

interface ClusterConfig {
  name: string;
  endpoint: string;
  network?: string;
  version?: string;
  genesisHash?: string;
}

const defaultClusters: ClusterConfig[] = [
  {
    name: 'devnet',
    endpoint: 'https://api.devnet.solana.com',
    network: 'devnet',
  },
  {
    name: 'testnet',
    endpoint: 'https://api.testnet.solana.com',
    network: 'testnet',
  },
  {
    name: 'mainnet-beta',
    endpoint: 'https://api.mainnet-beta.solana.com',
    network: 'mainnet-beta',
  },
  {
    name: 'local',
    endpoint: 'http://localhost:8899',
    network: 'localnet',
  },
];

export function SettingsUiCluster() {
  const [selectedCluster, setSelectedCluster] = useState<ClusterConfig>(defaultClusters[0]);
  const [clusters] = useState<ClusterConfig[]>(defaultClusters);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleClusterChange = (clusterName: string) => {
    if (clusterName === 'custom') {
      setIsCustom(true);
      setSelectedCluster({
        name: 'custom',
        endpoint: customEndpoint || 'https://custom-rpc-url.com',
        network: 'custom',
      });
    } else {
      setIsCustom(false);
      const cluster = clusters.find(c => c.name === clusterName);
      if (cluster) {
        setSelectedCluster(cluster);
      }
    }
  };

  const handleCustomEndpointChange = (value: string) => {
    setCustomEndpoint(value);
    if (isCustom) {
      setSelectedCluster({
        name: 'custom',
        endpoint: value,
        network: 'custom',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <AppText variant="labelMedium" className="text-gray-700 mb-2">
            Current Network
          </AppText>
          <AppText variant="bodyMedium" className="text-gray-900 font-medium">
            {selectedCluster.network || selectedCluster.name}
          </AppText>
        </div>
        
        <div>
          <AppText variant="labelMedium" className="text-gray-700 mb-2">
            RPC Endpoint
          </AppText>
          <AppText variant="bodySmall" className="text-gray-600 break-all">
            {selectedCluster.endpoint}
          </AppText>
        </div>
      </div>

      <div>
        <AppText variant="labelMedium" className="text-gray-700 mb-3">
          Select Network
        </AppText>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {clusters.map((cluster) => (
            <button
              key={cluster.name}
              onClick={() => handleClusterChange(cluster.name)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCluster.name === cluster.name && !isCustom
                  ? 'bg-[#00B49F] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cluster.name}
            </button>
          ))}
          <button
            onClick={() => handleClusterChange('custom')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isCustom
                ? 'bg-[#00B49F] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {isCustom && (
        <div className="mt-4">
          <SontineInput
            label="Custom RPC Endpoint"
            placeholder="https://your-custom-rpc-url.com"
            value={customEndpoint}
            onChangeText={handleCustomEndpointChange}
            helperText="Enter your custom Solana RPC endpoint URL"
          />
        </div>
      )}

      {selectedCluster.genesisHash && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <AppText variant="labelSmall" className="text-gray-600 mb-1">
            Genesis Hash
          </AppText>
          <AppText variant="bodySmall" className="text-gray-900 font-mono break-all">
            {selectedCluster.genesisHash}
          </AppText>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <AppText variant="bodySmall" className="text-blue-800">
          💡 Network changes will take effect after reconnecting your wallet
        </AppText>
      </div>
    </div>
  );
}