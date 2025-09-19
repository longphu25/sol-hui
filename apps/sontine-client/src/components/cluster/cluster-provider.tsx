'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
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

function loadInitialCluster(): Cluster {
  if (typeof window === 'undefined') {
    return AppConfig.clusters[0]!;
  }

  const persistedId = window.localStorage.getItem('sontine:selected-cluster-id');
  const foundCluster = AppConfig.clusters.find((cluster) => cluster.id === persistedId);

  return foundCluster ?? AppConfig.clusters[0]!;
}

export function ClusterProvider({ children }: ClusterProviderProps) {
  const [selectedCluster, setSelectedClusterState] = useState<Cluster>(loadInitialCluster);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sontine:selected-cluster-id', selectedCluster.id);
    }
  }, [selectedCluster.id]);

  const sortedClusters = useMemo(
    () => [...AppConfig.clusters].sort((a, b) => (a.name > b.name ? 1 : -1)),
    []
  );

  const setSelectedCluster = useCallback((cluster: Cluster) => {
    setSelectedClusterState(cluster);
  }, []);

  const value = useMemo<ClusterContextType>(
    () => ({
      clusters: sortedClusters,
      selectedCluster,
      setSelectedCluster,
    }),
    [sortedClusters, selectedCluster, setSelectedCluster]
  );

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
