import NetInfo from '@react-native-community/netinfo';
import { apiClient } from './apiClient';
import { transactionStorage } from '../storage/transactionStorage';
import { budgetStorage } from '../storage/budgetStorage';
import { goalStorage } from '../storage/goalStorage';
import { buildGoalSyncPayload, buildTransactionSyncPayload } from './syncPayload';
import { BudgetState, Goal, Transaction } from '../types';

interface ServerTransaction {
  clientId: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  notes?: string;
  clientUpdatedAt: string;
  deleted?: boolean;
  createdAt: string;
}

interface ServerBudget {
  monthlyLimit: number | null;
  categoryBudgets: BudgetState['categoryBudgets'];
}

interface ServerGoal {
  clientId: string;
  name: string;
  icon: string;
  targetAmount: number;
  targetDate: string;
  savedAmount: number;
  clientUpdatedAt: string;
  deleted?: boolean;
  createdAt: string;
}

async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

async function syncTransactions(token: string): Promise<void> {
  const local = await transactionStorage.getAll();
  const tombstones = await transactionStorage.getTombstones();
  const payload = buildTransactionSyncPayload(local, tombstones);

  const res = await apiClient.post<{ transactions: ServerTransaction[] }>(
    '/api/transactions/sync',
    { transactions: payload },
    token
  );

  const localById = new Map(local.map((t) => [t.id, t]));
  const merged: Transaction[] = res.transactions
    .filter((t) => !t.deleted)
    .map((t) => {
      const existing = localById.get(t.clientId);
      return {
        id: t.clientId,
        title: t.title,
        amount: t.amount,
        type: t.type as Transaction['type'],
        category: t.category as Transaction['category'],
        date: t.date,
        notes: t.notes,
        receiptUri: existing?.receiptUri,
        createdAt: existing?.createdAt ?? t.createdAt,
        updatedAt: t.clientUpdatedAt,
      };
    });

  await transactionStorage.replaceAll(merged);
  if (tombstones.length > 0) {
    await transactionStorage.clearTombstones(tombstones.map((t) => t.id));
  }
}

async function syncBudget(token: string): Promise<void> {
  const local = await budgetStorage.get();
  const clientUpdatedAt = local.updatedAt ?? new Date(0).toISOString();

  const res = await apiClient.post<{ budget: ServerBudget | null }>(
    '/api/budgets/sync',
    { monthlyLimit: local.monthlyLimit, categoryBudgets: local.categoryBudgets, clientUpdatedAt },
    token
  );

  if (res.budget) {
    await budgetStorage.save({ monthlyLimit: res.budget.monthlyLimit, categoryBudgets: res.budget.categoryBudgets });
  }
}

async function syncGoals(token: string): Promise<void> {
  const local = await goalStorage.getAll();
  const tombstones = await goalStorage.getTombstones();
  const payload = buildGoalSyncPayload(local, tombstones);

  const res = await apiClient.post<{ goals: ServerGoal[] }>('/api/goals/sync', { goals: payload }, token);

  const localById = new Map(local.map((g) => [g.id, g]));
  const merged: Goal[] = res.goals
    .filter((g) => !g.deleted)
    .map((g) => {
      const existing = localById.get(g.clientId);
      return {
        id: g.clientId,
        name: g.name,
        icon: g.icon,
        targetAmount: g.targetAmount,
        targetDate: g.targetDate,
        savedAmount: g.savedAmount,
        createdAt: existing?.createdAt ?? g.createdAt,
        updatedAt: g.clientUpdatedAt,
      };
    });

  await goalStorage.replaceAll(merged);
  if (tombstones.length > 0) {
    await goalStorage.clearTombstones(tombstones.map((g) => g.id));
  }
}

async function syncAll(token: string): Promise<void> {
  await syncTransactions(token);
  await syncBudget(token);
  await syncGoals(token);
}

export const syncService = { isOnline, syncAll };
