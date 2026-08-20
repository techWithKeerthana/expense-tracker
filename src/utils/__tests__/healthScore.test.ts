import test from 'node:test';
import assert from 'node:assert/strict';
import { computeHealthScore } from '../healthScore';
import { BudgetState, Goal, Transaction } from '../../types';

let nextId = 1;

function tx(overrides: Partial<Transaction> & Pick<Transaction, 'amount' | 'type' | 'category' | 'date'>): Transaction {
  const id = String(nextId++);
  return {
    id,
    title: `Transaction ${id}`,
    createdAt: overrides.date,
    updatedAt: overrides.date,
    ...overrides,
  };
}

function goal(overrides: Partial<Goal> & Pick<Goal, 'targetAmount' | 'savedAmount' | 'targetDate' | 'createdAt'>): Goal {
  const id = String(nextId++);
  return {
    id,
    name: `Goal ${id}`,
    icon: 'flag-outline',
    updatedAt: overrides.createdAt,
    ...overrides,
  };
}

function isoInMonth(monthsAgo: number, day = 15): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, day).toISOString();
}

const emptyBudget: BudgetState = { monthlyLimit: null, categoryBudgets: [] };

test('returns a neutral 50/fair score when there is no usable data at all', () => {
  const result = computeHealthScore([], emptyBudget, [], new Date());
  assert.equal(result.score, 50);
  assert.equal(result.band, 'fair');
});

test('high savings, healthy budget usage, and completed goals produce an excellent score', () => {
  const transactions = [
    tx({ amount: 5000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 1000, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 900, type: 'expense', category: 'Food', date: isoInMonth(1) }),
    tx({ amount: 1100, type: 'expense', category: 'Food', date: isoInMonth(2) }),
  ];
  const budget: BudgetState = { monthlyLimit: 2000, categoryBudgets: [] };
  const goals = [
    goal({ targetAmount: 1000, savedAmount: 1000, createdAt: isoInMonth(3), targetDate: isoInMonth(-1) }),
  ];
  const result = computeHealthScore(transactions, budget, goals, new Date());
  assert.ok(result.score >= 80, `expected an excellent score, got ${result.score}`);
  assert.equal(result.band, 'excellent');
});

test('spending far more than income produces a poor score', () => {
  const transactions = [
    tx({ amount: 500, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 3000, type: 'expense', category: 'Shopping', date: isoInMonth(0) }),
  ];
  const result = computeHealthScore(transactions, emptyBudget, [], new Date());
  assert.ok(result.score < 40, `expected a poor score, got ${result.score}`);
  assert.equal(result.band, 'poor');
});

test('excludes the savings factor when there is no income this month', () => {
  const transactions = [tx({ amount: 200, type: 'expense', category: 'Food', date: isoInMonth(0) })];
  const budget: BudgetState = { monthlyLimit: 500, categoryBudgets: [] };
  const result = computeHealthScore(transactions, budget, [], new Date());
  assert.ok(!result.factors.some((f) => f.key === 'savings'));
  assert.ok(result.factors.some((f) => f.key === 'budget'));
});

test('excludes the budget factor when no monthly budget is set', () => {
  const transactions = [
    tx({ amount: 1000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 200, type: 'expense', category: 'Food', date: isoInMonth(0) }),
  ];
  const result = computeHealthScore(transactions, emptyBudget, [], new Date());
  assert.ok(!result.factors.some((f) => f.key === 'budget'));
});

test('excludes the goals factor when there are no goals', () => {
  const transactions = [tx({ amount: 500, type: 'income', category: 'Salary', date: isoInMonth(0) })];
  const result = computeHealthScore(transactions, emptyBudget, [], new Date());
  assert.ok(!result.factors.some((f) => f.key === 'goals'));
});

test('included factor weights always sum to 1', () => {
  const transactions = [
    tx({ amount: 1000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 400, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 300, type: 'expense', category: 'Food', date: isoInMonth(1) }),
  ];
  const budget: BudgetState = { monthlyLimit: 800, categoryBudgets: [] };
  const goals = [goal({ targetAmount: 500, savedAmount: 100, createdAt: isoInMonth(1), targetDate: isoInMonth(-2) })];
  const result = computeHealthScore(transactions, budget, goals, new Date());
  const totalWeight = result.factors.reduce((sum, f) => sum + f.weight, 0);
  assert.ok(Math.abs(totalWeight - 1) < 0.001, `expected weights to sum to ~1, got ${totalWeight}`);
});
