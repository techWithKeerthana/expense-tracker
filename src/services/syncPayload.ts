import { Goal, Transaction } from '../types';

/**
 * Pure sync-payload builders — kept separate from AsyncStorage/network I/O so
 * the "does a deletion actually get communicated to the server" logic is
 * unit-testable in isolation. `tombstones` are records the user deleted
 * locally but that haven't been pushed to the server yet; without including
 * them, a deletion silently never reaches the server, and the next sync
 * response (still showing the record as `deleted: false`) resurrects it
 * locally — see the "Delete Transaction" bug this was written to fix.
 */

export interface TransactionSyncEntry {
  clientId: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  notes?: string;
  clientUpdatedAt: string;
  deleted: boolean;
}

export function buildTransactionSyncPayload(
  local: Transaction[],
  tombstones: Transaction[]
): TransactionSyncEntry[] {
  const toEntry = (t: Transaction, deleted: boolean): TransactionSyncEntry => ({
    clientId: t.id,
    title: t.title,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date,
    notes: t.notes,
    clientUpdatedAt: t.updatedAt,
    deleted,
  });
  return [...local.map((t) => toEntry(t, false)), ...tombstones.map((t) => toEntry(t, true))];
}

export interface GoalSyncEntry {
  clientId: string;
  name: string;
  icon: string;
  targetAmount: number;
  targetDate: string;
  savedAmount: number;
  clientUpdatedAt: string;
  deleted: boolean;
}

export function buildGoalSyncPayload(local: Goal[], tombstones: Goal[]): GoalSyncEntry[] {
  const toEntry = (g: Goal, deleted: boolean): GoalSyncEntry => ({
    clientId: g.id,
    name: g.name,
    icon: g.icon,
    targetAmount: g.targetAmount,
    targetDate: g.targetDate,
    savedAmount: g.savedAmount,
    clientUpdatedAt: g.updatedAt,
    deleted,
  });
  return [...local.map((g) => toEntry(g, false)), ...tombstones.map((g) => toEntry(g, true))];
}
