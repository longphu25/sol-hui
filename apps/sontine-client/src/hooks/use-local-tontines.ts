'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tontine } from '@/types/tontine';

const STORAGE_KEY = 'sontine:tontines';

export interface CreateTontineInput {
  name: string;
  description: string;
  contributionAmount: number;
  maxMembers: number;
  minMembersToStart: number;
  totalRounds: number;
  creatorAddress?: string | null;
  selectionMethod?: 'fixedOrder' | 'random' | 'auction';
  cycleDuration?: 'weekly' | 'monthly' | 'custom';
  customDurationDays?: number | null;
  auctionConfig?: {
    auctionDuration: number;
    minBidIncrement: number;
    maxInterestRate: number;
  } | null;
}

export type JoinResult =
  | { success: true; reason: null }
  | { success: false; reason: 'NOT_FOUND' | 'ALREADY_JOINED' | 'WALLET_REQUIRED' | 'GROUP_FULL' };

export interface LocalTontine extends Tontine {
  memberAddresses: string[];
  maxMembers: number;
  minMembersToStart: number;
  source: 'local';
  createdAt: string;
  createdBy: string | null;
}

type TontineUpdater = (prev: LocalTontine[]) => LocalTontine[];

function readFromStorage(): LocalTontine[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalTontine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      source: 'local',
      memberAddresses: item.memberAddresses ?? [],
      createdBy: item.createdBy ?? null,
      contractAddress: item.contractAddress ?? item.id,
      settings: item.settings ?? undefined,
    }));
  } catch (error) {
    console.warn('Failed to parse tontines from storage', error);
    return [];
  }
}

function writeToStorage(tontines: LocalTontine[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tontines));
  } catch (error) {
    console.warn('Failed to persist tontines to storage', error);
  }
}

export function useLocalTontines() {
  const [tontines, setTontines] = useState<LocalTontine[]>([]);

  useEffect(() => {
    setTontines(readFromStorage());
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setTontines(readFromStorage());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  const setAndPersist = useCallback((updater: TontineUpdater) => {
    setTontines((prev) => {
      const next = updater(prev);
      writeToStorage(next);
      return next;
    });
  }, []);

  const addTontine = useCallback(
    (input: CreateTontineInput): LocalTontine => {
      const id = `local-${Date.now()}`;
      const now = new Date().toISOString();

      const creatorAddress = input.creatorAddress ?? null;
      const initialMembers = creatorAddress ? [creatorAddress] : [];

      const contractAddress = id;

      const newTontine: LocalTontine = {
        id,
        name: input.name,
        description: input.description,
        contributionAmount: input.contributionAmount,
        totalAmount: input.contributionAmount * input.maxMembers,
        members: initialMembers.length,
        currentRound: 1,
        totalRounds: input.totalRounds,
        nextContribution: null,
        status: 'forming',
        myTurn: false,
        biddingOpen: false,
        gid: id,
        memberAddresses: initialMembers,
        maxMembers: input.maxMembers,
        minMembersToStart: input.minMembersToStart,
        source: 'local',
        createdAt: now,
        createdBy: creatorAddress,
        contractAddress,
        settings: {
          selectionMethod: input.selectionMethod,
          cycleDuration: input.cycleDuration,
          customDurationDays: input.customDurationDays ?? null,
          auctionConfig: input.auctionConfig ?? null,
        },
      };

      setAndPersist((prev) => [...prev, newTontine]);
      return newTontine;
    },
    [setAndPersist]
  );

  const joinTontine = useCallback(
    (tontineId: string, walletAddress: string | undefined): JoinResult => {
      if (!walletAddress) {
        return { success: false, reason: 'WALLET_REQUIRED' };
      }

      let joinResult: JoinResult = { success: false, reason: 'NOT_FOUND' };

      setAndPersist((prev) => {
        const index = prev.findIndex((item) => item.id === tontineId);
        if (index === -1) {
          joinResult = { success: false, reason: 'NOT_FOUND' };
          return prev;
        }

        const target = prev[index];
        if (target.memberAddresses.includes(walletAddress)) {
          joinResult = { success: false, reason: 'ALREADY_JOINED' };
          return prev;
        }

        if (target.memberAddresses.length >= target.maxMembers) {
          joinResult = { success: false, reason: 'GROUP_FULL' };
          return prev;
        }

        const updatedMembers = [...target.memberAddresses, walletAddress];
        const updatedStatus = updatedMembers.length >= target.minMembersToStart ? 'active' : target.status;
        const isFull = updatedMembers.length >= target.maxMembers;

        const updated: LocalTontine = {
          ...target,
          memberAddresses: updatedMembers,
          members: updatedMembers.length,
          status: isFull ? 'completed' : updatedStatus,
        };

        const next = [...prev];
        next[index] = updated;
        joinResult = { success: true, reason: null };
        return next;
      });

      return joinResult;
    },
    [setAndPersist]
  );

  const isMember = useCallback(
    (tontineId: string, walletAddress: string | undefined) => {
      if (!walletAddress) return false;
      return tontines.some((tontine) => tontine.id === tontineId && tontine.memberAddresses.includes(walletAddress));
    },
    [tontines]
  );

  const sortedTontines = useMemo(() => {
    return [...tontines].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }, [tontines]);

  const getTontineById = useCallback(
    (id: string) => tontines.find((tontine) => tontine.id === id) ?? null,
    [tontines]
  );

  return {
    tontines: sortedTontines,
    addTontine,
    joinTontine,
    isMember,
    getTontineById,
  };
}
