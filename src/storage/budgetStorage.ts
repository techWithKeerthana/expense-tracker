import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetState } from '../types';
import { STORAGE_KEYS } from './storageKeys';

const DEFAULT_BUDGET: BudgetState = {
  monthlyLimit: null,
  categoryBudgets: [],
};

async function get(): Promise<BudgetState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET);
  if (!raw) return DEFAULT_BUDGET;
  try {
    return { ...DEFAULT_BUDGET, ...(JSON.parse(raw) as BudgetState) };
  } catch {
    return DEFAULT_BUDGET;
  }
}

async function save(budget: BudgetState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify({ ...budget, updatedAt: new Date().toISOString() }));
}

export const budgetStorage = { get, save };
