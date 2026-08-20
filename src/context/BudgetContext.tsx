import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BudgetState, CategoryBudget } from '../types';
import { budgetStorage } from '../storage/budgetStorage';
import { syncBus } from '../services/syncBus';

interface BudgetContextValue {
  budget: BudgetState;
  isLoading: boolean;
  setMonthlyLimit: (limit: number | null) => Promise<void>;
  setCategoryBudget: (budget: CategoryBudget) => Promise<void>;
  removeCategoryBudget: (category: CategoryBudget['category']) => Promise<void>;
  refresh: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budget, setBudget] = useState<BudgetState>({ monthlyLimit: null, categoryBudgets: [] });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const saved = await budgetStorage.get();
    setBudget(saved);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setIsLoading(false);
    })();
  }, [refresh]);

  const persist = useCallback(async (next: BudgetState) => {
    setBudget(next);
    await budgetStorage.save(next);
    syncBus.notifyChanged();
  }, []);

  const setMonthlyLimit = useCallback(
    async (limit: number | null) => {
      await persist({ ...budget, monthlyLimit: limit });
    },
    [budget, persist]
  );

  const setCategoryBudget = useCallback(
    async (categoryBudget: CategoryBudget) => {
      const others = budget.categoryBudgets.filter((c) => c.category !== categoryBudget.category);
      await persist({ ...budget, categoryBudgets: [...others, categoryBudget] });
    },
    [budget, persist]
  );

  const removeCategoryBudget = useCallback(
    async (category: CategoryBudget['category']) => {
      await persist({
        ...budget,
        categoryBudgets: budget.categoryBudgets.filter((c) => c.category !== category),
      });
    },
    [budget, persist]
  );

  const value = useMemo(
    () => ({ budget, isLoading, setMonthlyLimit, setCategoryBudget, removeCategoryBudget, refresh }),
    [budget, isLoading, setMonthlyLimit, setCategoryBudget, removeCategoryBudget, refresh]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within a BudgetProvider');
  return ctx;
}
