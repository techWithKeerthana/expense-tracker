import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, GoalInput } from '../types';
import { STORAGE_KEYS } from './storageKeys';
import { generateId } from '../utils/id';

/**
 * Storage service layer for financial goals. Screens must never call
 * AsyncStorage directly — always go through this module.
 */
async function getAll(): Promise<Goal[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Goal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAll(goals: Goal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
}

async function add(input: GoalInput): Promise<Goal> {
  const goals = await getAll();
  const now = new Date().toISOString();
  const goal: Goal = {
    ...input,
    id: generateId(),
    savedAmount: 0,
    createdAt: now,
    updatedAt: now,
  };
  goals.unshift(goal);
  await saveAll(goals);
  return goal;
}

async function update(id: string, input: GoalInput): Promise<Goal | null> {
  const goals = await getAll();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1) return null;
  const updated: Goal = {
    ...goals[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  goals[index] = updated;
  await saveAll(goals);
  return updated;
}

async function addContribution(id: string, amount: number): Promise<Goal | null> {
  const goals = await getAll();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1) return null;
  const updated: Goal = {
    ...goals[index],
    savedAmount: Math.max(0, goals[index].savedAmount + amount),
    updatedAt: new Date().toISOString(),
  };
  goals[index] = updated;
  await saveAll(goals);
  return updated;
}

async function remove(id: string): Promise<void> {
  const goals = await getAll();
  const deleted = goals.find((g) => g.id === id);
  await saveAll(goals.filter((g) => g.id !== id));
  if (deleted) {
    const tombstones = await getTombstones();
    const tombstone: Goal = { ...deleted, updatedAt: new Date().toISOString() };
    await saveTombstones([...tombstones.filter((t) => t.id !== id), tombstone]);
  }
}

/** Deleted goals awaiting their next sync push, so the server actually learns about the deletion. */
async function getTombstones(): Promise<Goal[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_GOALS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Goal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveTombstones(tombstones: Goal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.DELETED_GOALS, JSON.stringify(tombstones));
}

/** Call after tombstones have been successfully pushed to the server. */
async function clearTombstones(ids: string[]): Promise<void> {
  const tombstones = await getTombstones();
  await saveTombstones(tombstones.filter((t) => !ids.includes(t.id)));
}

async function replaceAll(goals: Goal[]): Promise<void> {
  await saveAll(goals);
}

export const goalStorage = { getAll, add, update, addContribution, remove, replaceAll, getTombstones, clearTombstones };
