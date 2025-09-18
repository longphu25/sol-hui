import { clusterApiUrl } from '@solana/web3.js';

export interface Cluster {
  id: string;
  name: string;
  endpoint: string;
  network: ClusterNetwork;
}

export enum ClusterNetwork {
  Devnet = 'devnet',
  Mainnet = 'mainnet-beta',
  Testnet = 'testnet',
}

export class AppConfig {
  static appName = 'Sontine';
  static tagline = 'Tontine Meets Blockchain';
  static description =
    'Join the future of rotating savings with Sontine. Built on Solana blockchain for transparent, automated, and global tontine groups.';
  static uri = 'https://sontine.fun';
  static version = '1.0.0';
  static build = '2025.07.01';

  static clusters: Cluster[] = [
    {
      id: 'solana:devnet',
      name: 'Devnet',
      endpoint: 'https://devnet.helius-rpc.com/?api-key=b5f8c1a8-7580-49f7-8197-ed0d48aaa178',
      network: ClusterNetwork.Devnet,
    },
    {
      id: 'solana:mainnet',
      name: 'Mainnet',
      endpoint: clusterApiUrl('mainnet-beta'),
      network: ClusterNetwork.Mainnet,
    },
  ];

  static features = {
    notifications: true,
    biometricAuth: false, // Not available on web
    darkMode: true,
    multiLanguage: false,
  };

  static limits = {
    maxTontinesPerUser: 10,
    minContributionAmount: 0.1, // SOL
    maxContributionAmount: 1000, // SOL
    maxMembersPerTontine: 50,
    minMembersPerTontine: 3,
  };
}