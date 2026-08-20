import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Transaction, TransactionInput } from '../types';
import { transactionStorage } from '../storage/transactionStorage';
import { syncBus } from '../services/syncBus';

interface TransactionContextValue {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  replaceAll: (transactions: Transaction[]) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextValue | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await transactionStorage.getAll();
    setTransactions(all);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setIsLoading(false);
    })();
  }, [refresh]);

  const addTransaction = useCallback(async (input: TransactionInput) => {
    const created = await transactionStorage.add(input);
    await refresh();
    syncBus.notifyChanged();
    return created;
  }, [refresh]);

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput) => {
      await transactionStorage.update(id, input);
      await refresh();
      syncBus.notifyChanged();
    },
    [refresh]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await transactionStorage.remove(id);
      await refresh();
      syncBus.notifyChanged();
    },
    [refresh]
  );

  const replaceAll = useCallback(
    async (next: Transaction[]) => {
      await transactionStorage.replaceAll(next);
      await refresh();
      syncBus.notifyChanged();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      transactions,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refresh,
      replaceAll,
    }),
    [transactions, isLoading, addTransaction, updateTransaction, deleteTransaction, refresh, replaceAll]
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within a TransactionProvider');
  return ctx;
}
