import { Goal } from '../types';

export type GoalStatus = 'completed' | 'overdue' | 'on-track' | 'behind';

export interface GoalProgress {
  percent: number; // 0-100, clamped
  remaining: number;
  status: GoalStatus;
  daysRemaining: number; // negative if past the target date
}

/**
 * Rule-based goal progress calculation — compares how much of the target
 * amount has been saved against how much of the target timeline has
 * elapsed, to flag whether a goal looks "on track" or "behind". No AI/ML.
 */
export function computeGoalProgress(goal: Goal, now: Date = new Date()): GoalProgress {
  const percent = goal.targetAmount > 0 ? Math.min(100, Math.max(0, (goal.savedAmount / goal.targetAmount) * 100)) : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const targetDate = new Date(goal.targetDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / msPerDay);

  if (goal.savedAmount >= goal.targetAmount) {
    return { percent, remaining, status: 'completed', daysRemaining };
  }
  if (daysRemaining < 0) {
    return { percent, remaining, status: 'overdue', daysRemaining };
  }

  const createdDate = new Date(goal.createdAt);
  const totalDurationMs = targetDate.getTime() - createdDate.getTime();
  const elapsedMs = now.getTime() - createdDate.getTime();
  const expectedPercent =
    totalDurationMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100)) : 100;

  // Small tolerance so goals only just started aren't immediately flagged "behind".
  const status: GoalStatus = percent + 10 >= expectedPercent ? 'on-track' : 'behind';
  return { percent, remaining, status, daysRemaining };
}
