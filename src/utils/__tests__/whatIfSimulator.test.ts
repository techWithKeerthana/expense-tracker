import test from 'node:test';
import assert from 'node:assert/strict';
import { computeWhatIf, WhatIfScenario } from '../whatIfSimulator';
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

function daysFromNow(days: number, from: Date = new Date()): string {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

const emptyBudget: BudgetState = { monthlyLimit: null, categoryBudgets: [] };
const noChangeScenario: WhatIfScenario = { categoryAdjustments: {}, extraMonthlyIncome: 0 };

test('with no adjustments, the projection matches the current totals exactly', () => {
  const now = new Date();
  const transactions = [
    tx({ amount: 1000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 400, type: 'expense', category: 'Food', date: isoInMonth(0) }),
  ];
  const result = computeWhatIf(transactions, emptyBudget, [], noChangeScenario, now);
  assert.equal(result.projected.income, result.current.income);
  assert.equal(result.projected.expense, result.current.expense);
  assert.equal(result.balanceDelta, 0);
});

test('cutting a category by a percentage reduces projected expense accordingly', () => {
  const now = new Date();
  const transactions = [
    tx({ amount: 1000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 500, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 200, type: 'expense', category: 'Travel', date: isoInMonth(0) }),
  ];
  const scenario: WhatIfScenario = { categoryAdjustments: { Food: -20 }, extraMonthlyIncome: 0 };
  const result = computeWhatIf(transactions, emptyBudget, [], scenario, now);
  // Food: 500 -> 400 (-20%), Travel unchanged at 200 => projected expense 600
  assert.equal(result.projected.expense, 600);
  assert.equal(result.balanceDelta, 100);
});

test('adding extra monthly income increases projected income and balance', () => {
  const now = new Date();
  const transactions = [
    tx({ amount: 1000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 400, type: 'expense', category: 'Food', date: isoInMonth(0) }),
  ];
  const scenario: WhatIfScenario = { categoryAdjustments: {}, extraMonthlyIncome: 500 };
  const result = computeWhatIf(transactions, emptyBudget, [], scenario, now);
  assert.equal(result.projected.income, 1500);
  assert.equal(result.balanceDelta, 500);
});

test('budget impact is computed when a monthly limit is set', () => {
  const now = new Date();
  const transactions = [tx({ amount: 800, type: 'expense', category: 'Food', date: isoInMonth(0) })];
  const budget: BudgetState = { monthlyLimit: 1000, categoryBudgets: [] };
  const scenario: WhatIfScenario = { categoryAdjustments: { Food: -50 }, extraMonthlyIncome: 0 };
  const result = computeWhatIf(transactions, budget, [], scenario, now);
  assert.ok(result.budgetImpact);
  assert.equal(result.budgetImpact?.currentUsedPercent, 80);
  assert.equal(result.budgetImpact?.projectedUsedPercent, 40);
});

test('budget impact is null when no monthly limit is set', () => {
  const result = computeWhatIf([], emptyBudget, [], noChangeScenario, new Date());
  assert.equal(result.budgetImpact, null);
});

test('a positive balance change shortens the projected ETA for active goals', () => {
  const now = new Date();
  const transactions = [
    tx({ amount: 1000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 400, type: 'expense', category: 'Food', date: isoInMonth(0) }),
  ];
  const g = goal({
    targetAmount: 1000,
    savedAmount: 200,
    createdAt: daysFromNow(-60, now),
    targetDate: daysFromNow(120, now),
  });
  const scenario: WhatIfScenario = { categoryAdjustments: { Food: -50 }, extraMonthlyIncome: 0 };
  const result = computeWhatIf(transactions, emptyBudget, [g], scenario, now);
  assert.equal(result.goalProjections.length, 1);
  const projection = result.goalProjections[0];
  assert.ok(projection.currentEtaMonths !== null);
  assert.ok(projection.projectedEtaMonths !== null);
  assert.ok(projection.monthsSaved !== null && projection.monthsSaved > 0);
});

test('completed goals are excluded from goal projections', () => {
  const now = new Date();
  const g = goal({
    targetAmount: 1000,
    savedAmount: 1000,
    createdAt: daysFromNow(-60, now),
    targetDate: daysFromNow(10, now),
  });
  const result = computeWhatIf([], emptyBudget, [g], noChangeScenario, now);
  assert.equal(result.goalProjections.length, 0);
});

test('a goal with no saving history yet has a null current ETA', () => {
  const now = new Date();
  const g = goal({
    targetAmount: 1000,
    savedAmount: 0,
    createdAt: now.toISOString(),
    targetDate: daysFromNow(90, now),
  });
  const result = computeWhatIf([], emptyBudget, [g], noChangeScenario, now);
  assert.equal(result.goalProjections[0].currentEtaMonths, null);
});
