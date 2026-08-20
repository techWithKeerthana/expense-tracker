import test from 'node:test';
import assert from 'node:assert/strict';
import {
  answerFinancialQuery,
  detectCategory,
  detectIntent,
  detectPeriod,
} from '../aiAssistant';
import { BudgetState, Transaction } from '../../types';

let nextId = 1;

function tx(overrides: Partial<Transaction> & Pick<Transaction, 'amount' | 'type' | 'category' | 'date'>): Transaction {
  const id = String(nextId++);
  return {
    id,
    title: overrides.title ?? `Transaction ${id}`,
    createdAt: overrides.date,
    updatedAt: overrides.date,
    ...overrides,
  };
}

function isoInMonth(monthsAgo: number, day = 15): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, day).toISOString();
}

const emptyBudget: BudgetState = { monthlyLimit: null, categoryBudgets: [] };

// ---- detectCategory ----

test('detectCategory finds a known category mentioned in the query', () => {
  assert.equal(detectCategory('How much did I spend on Food this month?'), 'Food');
  assert.equal(detectCategory('travel expenses'), 'Travel');
});

test('detectCategory returns null when no category is mentioned', () => {
  assert.equal(detectCategory("What's my balance?"), null);
});

// ---- detectPeriod ----

test('detectPeriod recognizes "last month" and "this month"', () => {
  assert.equal(detectPeriod('How much did I spend last month?'), 'last-month');
  assert.equal(detectPeriod('How much did I spend this month?'), 'this-month');
  assert.equal(detectPeriod('How much did I spend?'), 'all-time');
});

// ---- detectIntent ----

test('detectIntent maps common phrasings to the right intent', () => {
  assert.equal(detectIntent('Am I over budget?'), 'budget-status');
  assert.equal(detectIntent('Compare this month to last month'), 'trend-compare');
  assert.equal(detectIntent("What's my highest spending category?"), 'highest-category');
  assert.equal(detectIntent('How much did I spend on Food this month?'), 'category-spend');
  assert.equal(detectIntent('What is my average expense?'), 'average-spend');
  assert.equal(detectIntent('How many transactions do I have?'), 'transaction-count');
  assert.equal(detectIntent('income vs expense'), 'income-vs-expense');
  assert.equal(detectIntent('How much did I earn?'), 'income-total');
  assert.equal(detectIntent('How much did I spend?'), 'expense-total');
  assert.equal(detectIntent("What's my balance?"), 'balance');
  assert.equal(detectIntent('asdkjhasd random gibberish'), 'unknown');
});

// ---- answerFinancialQuery: balance / income / expense ----

test('balance answer reflects income minus expense', () => {
  const transactions = [
    tx({ amount: 1000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 300, type: 'expense', category: 'Food', date: isoInMonth(0) }),
  ];
  const answer = answerFinancialQuery("What's my balance?", transactions, emptyBudget);
  assert.equal(answer.intent, 'balance');
  assert.match(answer.message, /700/);
});

test('income-vs-expense answer compares totals for the period', () => {
  const transactions = [
    tx({ amount: 1000, type: 'income', category: 'Salary', date: isoInMonth(0) }),
    tx({ amount: 1200, type: 'expense', category: 'Shopping', date: isoInMonth(0) }),
  ];
  const answer = answerFinancialQuery('income vs expense this month', transactions, emptyBudget);
  assert.equal(answer.intent, 'income-vs-expense');
  assert.match(answer.message, /less than you spent/);
});

// ---- category-spend ----

test('category-spend reports the total spent on a mentioned category', () => {
  const transactions = [
    tx({ amount: 250, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 150, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 500, type: 'expense', category: 'Travel', date: isoInMonth(0) }),
  ];
  const answer = answerFinancialQuery('How much did I spend on Food this month?', transactions, emptyBudget);
  assert.equal(answer.intent, 'category-spend');
  assert.match(answer.message, /400/);
  assert.match(answer.message, /Food/);
});

test('category-spend handles a category with zero spend gracefully', () => {
  const transactions = [tx({ amount: 100, type: 'expense', category: 'Food', date: isoInMonth(0) })];
  const answer = answerFinancialQuery('How much did I spend on Travel?', transactions, emptyBudget);
  assert.equal(answer.intent, 'category-spend');
  assert.match(answer.message, /haven't spent anything/);
});

// ---- highest-category ----

test('highest-category identifies the top expense category', () => {
  const transactions = [
    tx({ amount: 100, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 900, type: 'expense', category: 'Shopping', date: isoInMonth(0) }),
  ];
  const answer = answerFinancialQuery("What's my highest spending category?", transactions, emptyBudget);
  assert.equal(answer.intent, 'highest-category');
  assert.match(answer.message, /Shopping/);
});

test('highest-category handles no expense data', () => {
  const answer = answerFinancialQuery("What's my highest spending category?", [], emptyBudget);
  assert.match(answer.message, /don't have any expenses/);
});

// ---- budget-status ----

test('budget-status reports remaining amount when under the monthly limit', () => {
  const transactions = [tx({ amount: 400, type: 'expense', category: 'Food', date: isoInMonth(0) })];
  const budget: BudgetState = { monthlyLimit: 1000, categoryBudgets: [] };
  const answer = answerFinancialQuery('Am I over budget?', transactions, budget);
  assert.equal(answer.intent, 'budget-status');
  assert.match(answer.message, /600/);
  assert.doesNotMatch(answer.message, /over your monthly budget/);
});

test('budget-status reports overage when over the monthly limit', () => {
  const transactions = [tx({ amount: 1200, type: 'expense', category: 'Food', date: isoInMonth(0) })];
  const budget: BudgetState = { monthlyLimit: 1000, categoryBudgets: [] };
  const answer = answerFinancialQuery('Am I over budget?', transactions, budget);
  assert.match(answer.message, /over your monthly budget/);
  assert.match(answer.message, /200/);
});

test('budget-status prompts to set a budget when none exists', () => {
  const answer = answerFinancialQuery('Am I over budget?', [], emptyBudget);
  assert.match(answer.message, /haven't set a monthly budget/);
});

test('budget-status can answer for a specific category budget', () => {
  const transactions = [tx({ amount: 300, type: 'expense', category: 'Food', date: isoInMonth(0) })];
  const budget: BudgetState = { monthlyLimit: null, categoryBudgets: [{ category: 'Food', limit: 200 }] };
  const answer = answerFinancialQuery('Am I over budget on Food?', transactions, budget);
  assert.match(answer.message, /over your Food budget/);
});

// ---- trend-compare ----

test('trend-compare reports increased spending vs last month', () => {
  const transactions = [
    tx({ amount: 500, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 200, type: 'expense', category: 'Food', date: isoInMonth(1) }),
  ];
  const answer = answerFinancialQuery('Compare this month to last month', transactions, emptyBudget);
  assert.equal(answer.intent, 'trend-compare');
  assert.match(answer.message, /more this month/);
});

test('trend-compare handles no data for either month', () => {
  const answer = answerFinancialQuery('Compare this month to last month', [], emptyBudget);
  assert.match(answer.message, /no expense data/);
});

// ---- average-spend / transaction-count ----

test('average-spend computes the mean expense amount', () => {
  const transactions = [
    tx({ amount: 100, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 300, type: 'expense', category: 'Food', date: isoInMonth(0) }),
  ];
  const answer = answerFinancialQuery('What is my average expense?', transactions, emptyBudget);
  assert.match(answer.message, /200/);
});

test('transaction-count reports the number of transactions in scope', () => {
  const transactions = [
    tx({ amount: 100, type: 'expense', category: 'Food', date: isoInMonth(0) }),
    tx({ amount: 200, type: 'income', category: 'Salary', date: isoInMonth(0) }),
  ];
  const answer = answerFinancialQuery('How many transactions do I have this month?', transactions, emptyBudget);
  assert.match(answer.message, /^You have 2 transactions/);
});

// ---- unknown fallback ----

test('unrecognized queries return a helpful fallback message with examples', () => {
  const answer = answerFinancialQuery('asdkjhasd random gibberish', [], emptyBudget);
  assert.equal(answer.intent, 'unknown');
  assert.match(answer.message, /not sure how to answer/);
});
