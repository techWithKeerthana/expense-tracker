import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAccount } from './AccountContext';
import { useTransactions } from './TransactionContext';
import { useBudget } from './BudgetContext';
import { useGoals } from './GoalContext';
import { syncBus } from '../services/syncBus';
import { syncService } from '../services/syncService';
import { SyncStatus } from '../types';

interface SyncContextValue {
  status: SyncStatus;
  triggerSync: () => void;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

const DEBOUNCE_MS = 1500;

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAccount();
  const { refresh: refreshTransactions } = useTransactions();
  const { refresh: refreshBudget } = useBudget();
  const { refresh: refreshGoals } = useGoals();
  const [status, setStatus] = useState<SyncStatus>('offline');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false);

  const runSync = useMemo(
    () => async () => {
      if (!isAuthenticated || !token || syncingRef.current) return;

      const online = await syncService.isOnline();
      if (!online) {
        setStatus('offline');
        return;
      }

      syncingRef.current = true;
      setStatus('syncing');
      try {
        await syncService.syncAll(token);
        await Promise.all([refreshTransactions(), refreshBudget(), refreshGoals()]);
        setStatus('synced');
      } catch {
        setStatus('error');
      } finally {
        syncingRef.current = false;
      }
    },
    [isAuthenticated, token, refreshTransactions, refreshBudget, refreshGoals]
  );

  const triggerSync = useMemo(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(runSync, DEBOUNCE_MS);
    },
    [runSync]
  );

  useEffect(() => {
    if (isAuthenticated) runSync();
  }, [isAuthenticated, runSync]);

  useEffect(() => {
    const unsubscribeBus = syncBus.subscribe(triggerSync);
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      if (state.isConnected && isAuthenticated) runSync();
    });
    return () => {
      unsubscribeBus();
      unsubscribeNet();
    };
  }, [triggerSync, runSync, isAuthenticated]);

  const value = useMemo(() => ({ status, triggerSync }), [status, triggerSync]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within a SyncProvider');
  return ctx;
}
