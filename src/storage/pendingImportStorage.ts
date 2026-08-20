import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryName } from '../types';
import { STORAGE_KEYS } from './storageKeys';

export interface PendingImport {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: CategoryName;
  date: string;
  sourceApp: string;
  rawText: string;
  detectedAt: string;
}

const KEY = STORAGE_KEYS.PENDING_IMPORTS;

async function getAll(): Promise<PendingImport[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PendingImport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function add(pending: PendingImport): Promise<void> {
  const all = await getAll();
  // Avoid duplicate queueing if the same notification is delivered more than once.
  if (all.some((p) => p.id === pending.id)) return;
  all.unshift(pending);
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

async function remove(id: string): Promise<void> {
  const all = await getAll();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter((p) => p.id !== id)));
}

export const pendingImportStorage = { getAll, add, remove };
