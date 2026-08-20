import test from 'node:test';
import assert from 'node:assert/strict';
import { computeGoalProgress } from '../goalProgress';
import { Goal } from '../../types';

let nextId = 1;

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

function daysFromNow(days: number, from: Date = new Date()): string {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

test('a fully-funded goal is reported as completed regardless of date', () => {
  const now = new Date();
  const g = goal({
    targetAmount: 1000,
    savedAmount: 1000,
    createdAt: daysFromNow(-30, now),
    targetDate: daysFromNow(10, now),
  });
  const progress = computeGoalProgress(g, now);
  assert.equal(progress.status, 'completed');
  assert.equal(progress.percent, 100);
  assert.equal(progress.remaining, 0);
});

test('an overfunded goal clamps percent at 100 and remaining at 0', () => {
  const now = new Date();
  const g = goal({
    targetAmount: 1000,
    savedAmount: 1500,
    createdAt: daysFromNow(-30, now),
    targetDate: daysFromNow(10, now),
  });
  const progress = computeGoalProgress(g, now);
  assert.equal(progress.percent, 100);
  assert.equal(progress.remaining, 0);
});

test('a goal past its target date and not yet funded is overdue', () => {
  const now = new Date();
  const g = goal({
    targetAmount: 1000,
    savedAmount: 200,
    createdAt: daysFromNow(-60, now),
    targetDate: daysFromNow(-1, now),
  });
  const progress = computeGoalProgress(g, now);
  assert.equal(progress.status, 'overdue');
  assert.ok(progress.daysRemaining < 0);
});

test('a goal saving faster than the elapsed timeline is on-track', () => {
  const now = new Date();
  // 50% of the time has elapsed (30 of 60 days), but 60% of the amount is saved.
  const g = goal({
    targetAmount: 1000,
    savedAmount: 600,
    createdAt: daysFromNow(-30, now),
    targetDate: daysFromNow(30, now),
  });
  const progress = computeGoalProgress(g, now);
  assert.equal(progress.status, 'on-track');
  assert.equal(progress.remaining, 400);
});

test('a goal saving much slower than the elapsed timeline is behind', () => {
  const now = new Date();
  // 75% of the time has elapsed (45 of 60 days), but only 10% of the amount is saved.
  const g = goal({
    targetAmount: 1000,
    savedAmount: 100,
    createdAt: daysFromNow(-45, now),
    targetDate: daysFromNow(15, now),
  });
  const progress = computeGoalProgress(g, now);
  assert.equal(progress.status, 'behind');
});

test('a brand-new goal with no time elapsed is not immediately flagged behind', () => {
  const now = new Date();
  const g = goal({
    targetAmount: 1000,
    savedAmount: 0,
    createdAt: now.toISOString(),
    targetDate: daysFromNow(30, now),
  });
  const progress = computeGoalProgress(g, now);
  assert.equal(progress.status, 'on-track');
});
