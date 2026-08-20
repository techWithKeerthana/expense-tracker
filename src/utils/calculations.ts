import { CategoryName, Transaction } from '../types';
import { isSameMonth } from './formatters';

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export function computeTotals(transactions: Transaction[]): Totals {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, balance: income - expense };
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense' = 'expense'
): { category: CategoryName; total: number }[] {
  const map = new Map<CategoryName, number>();
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });
  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function filterByMonth(transactions: Transaction[], reference: Date): Transaction[] {
  return transactions.filter((t) => isSameMonth(t.date, reference));
}

export function computeMonthlyTrend(
  transactions: Transaction[],
  monthsBack = 6
): { label: string; income: number; expense: number }[] {
  const now = new Date();
  const result: { label: string; income: number; expense: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTx = filterByMonth(transactions, ref);
    const totals = computeTotals(monthTx);
    result.push({
      label: ref.toLocaleDateString('en-IN', { month: 'short' }),
      income: totals.income,
      expense: totals.expense,
    });
  }
  return result;
}

export function computeAverageSpending(transactions: Transaction[]): number {
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (expenses.length === 0) return 0;
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  return total / expenses.length;
}
