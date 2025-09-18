'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppConfig, Cluster } from '@/constants/app-config';

interface ClusterContextType {
  clusters: Cluster[];
  selectedCluster: Cluster;
  setSelectedCluster: (cluster: Cluster) => void;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

interface ClusterProviderProps {
  children: ReactNode;
}

export function ClusterProvider({ children }: ClusterProviderProps) {
  const [selectedCluster, setSelectedCluster] = useState<Cluster>(AppConfig.clusters[0]!);

  const value: ClusterContextType = {
    clusters: [...AppConfig.clusters].sort((a, b) => (a.name > b.name ? 1 : -1)),
    selectedCluster,
    setSelectedCluster,
  };

  return (
    <ClusterContext.Provider value={value}>
      {children}
    </ClusterContext.Provider>
  );
}

export function useCluster() {
  const context = useContext(ClusterContext);
  if (!context) {
    throw new Error('useCluster must be used within a ClusterProvider');
  }
  return context;
}