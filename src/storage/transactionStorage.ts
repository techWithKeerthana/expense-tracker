import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionInput } from '../types';
import { STORAGE_KEYS } from './storageKeys';
import { generateId } from '../utils/id';

/**
 * Storage service layer for transactions. Screens must never call
 * AsyncStorage directly — always go through this module.
 */
async function getAll(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAll(transactions: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

async function add(input: TransactionInput): Promise<Transaction> {
  const transactions = await getAll();
  const now = new Date().toISOString();
  const transaction: Transaction = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  transactions.unshift(transaction);
  await saveAll(transactions);
  return transaction;
}

async function update(id: string, input: TransactionInput): Promise<Transaction | null> {
  const transactions = await getAll();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated: Transaction = {
    ...transactions[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  transactions[index] = updated;
  await saveAll(transactions);
  return updated;
}

async function remove(id: string): Promise<void> {
  const transactions = await getAll();
  const deleted = transactions.find((t) => t.id === id);
  await saveAll(transactions.filter((t) => t.id !== id));
  if (deleted) {
    const tombstones = await getTombstones();
    const tombstone: Transaction = { ...deleted, updatedAt: new Date().toISOString() };
    await saveTombstones([...tombstones.filter((t) => t.id !== id), tombstone]);
  }
}

/** Deleted transactions awaiting their next sync push, so the server actually learns about the deletion. */
async function getTombstones(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_TRANSACTIONS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveTombstones(tombstones: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.DELETED_TRANSACTIONS, JSON.stringify(tombstones));
}

/** Call after tombstones have been successfully pushed to the server. */
async function clearTombstones(ids: string[]): Promise<void> {
  const tombstones = await getTombstones();
  await saveTombstones(tombstones.filter((t) => !ids.includes(t.id)));
}

async function getById(id: string): Promise<Transaction | null> {
  const transactions = await getAll();
  return transactions.find((t) => t.id === id) ?? null;
}

async function replaceAll(transactions: Transaction[]): Promise<void> {
  await saveAll(transactions);
}

async function clearAll(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
}

export const transactionStorage = {
  getAll,
  add,
  update,
  remove,
  getById,
  replaceAll,
  clearAll,
  getTombstones,
  clearTombstones,
};
