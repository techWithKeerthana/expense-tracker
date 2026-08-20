import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Goal, GoalInput } from '../types';
import { goalStorage } from '../storage/goalStorage';
import { syncBus } from '../services/syncBus';

interface GoalContextValue {
  goals: Goal[];
  isLoading: boolean;
  addGoal: (input: GoalInput) => Promise<Goal>;
  updateGoal: (id: string, input: GoalInput) => Promise<void>;
  addContribution: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  replaceAll: (goals: Goal[]) => Promise<void>;
}

const GoalContext = createContext<GoalContextValue | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await goalStorage.getAll();
    setGoals(all);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setIsLoading(false);
    })();
  }, [refresh]);

  const addGoal = useCallback(
    async (input: GoalInput) => {
      const created = await goalStorage.add(input);
      await refresh();
      syncBus.notifyChanged();
      return created;
    },
    [refresh]
  );

  const updateGoal = useCallback(
    async (id: string, input: GoalInput) => {
      await goalStorage.update(id, input);
      await refresh();
      syncBus.notifyChanged();
    },
    [refresh]
  );

  const addContribution = useCallback(
    async (id: string, amount: number) => {
      await goalStorage.addContribution(id, amount);
      await refresh();
      syncBus.notifyChanged();
    },
    [refresh]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      await goalStorage.remove(id);
      await refresh();
      syncBus.notifyChanged();
    },
    [refresh]
  );

  const replaceAll = useCallback(
    async (next: Goal[]) => {
      await goalStorage.replaceAll(next);
      await refresh();
      syncBus.notifyChanged();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({ goals, isLoading, addGoal, updateGoal, addContribution, deleteGoal, refresh, replaceAll }),
    [goals, isLoading, addGoal, updateGoal, addContribution, deleteGoal, refresh, replaceAll]
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoals(): GoalContextValue {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoals must be used within a GoalProvider');
  return ctx;
}
