import { BudgetState, CategoryName, Goal, Transaction } from '../types';
import { computeCategoryBreakdown, computeTotals, filterByMonth } from './calculations';
import { computeGoalProgress } from './goalProgress';

/**
 * What-If Simulator — pure "reuse the existing calculations" projection.
 * Nothing here is persisted; it recomputes this month's totals with a
 * hypothetical set of changes applied and reports the projected impact on
 * balance, budget headroom, and each active goal's estimated completion.
 * No AI/ML, fully explainable.
 */

export interface WhatIfScenario {
  /** Percent change per category, e.g. -20 means "cut this category's spend by 20%". */
  categoryAdjustments: Partial<Record<CategoryName, number>>;
  /** Flat amount added to (or subtracted from, if negative) monthly income. */
  extraMonthlyIncome: number;
}

export interface MonthlyTotals {
  income: number;
  expense: number;
  balance: number;
}

export interface BudgetImpact {
  monthlyLimit: number;
  currentUsedPercent: number;
  projectedUsedPercent: number;
}

export interface GoalProjection {
  goalId: string;
  name: string;
  /** Months to reach the target at the current historical saving pace, or null if that pace is 0. */
  currentEtaMonths: number | null;
  /** Months to reach the target if the projected monthly balance change is redirected toward it too. */
  projectedEtaMonths: number | null;
  /** Positive means the projection reaches the goal sooner; null if either ETA is unknown. */
  monthsSaved: number | null;
}

export interface WhatIfResult {
  current: MonthlyTotals;
  projected: MonthlyTotals;
  balanceDelta: number;
  budgetImpact: BudgetImpact | null;
  goalProjections: GoalProjection[];
}

const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;

function monthsBetween(from: Date, to: Date): number {
  return Math.max(1, (to.getTime() - from.getTime()) / MS_PER_MONTH);
}

export function computeWhatIf(
  transactions: Transaction[],
  budget: BudgetState,
  goals: Goal[],
  scenario: WhatIfScenario,
  now: Date = new Date()
): WhatIfResult {
  const thisMonthTx = filterByMonth(transactions, now);
  const current = computeTotals(thisMonthTx);

  const breakdown = computeCategoryBreakdown(thisMonthTx, 'expense');
  const projectedExpense = breakdown.reduce((sum, entry) => {
    const adjustmentPercent = scenario.categoryAdjustments[entry.category] ?? 0;
    return sum + entry.total * (1 + adjustmentPercent / 100);
  }, 0);
  const projectedIncome = current.income + scenario.extraMonthlyIncome;
  const projected: MonthlyTotals = {
    income: projectedIncome,
    expense: projectedExpense,
    balance: projectedIncome - projectedExpense,
  };
  const balanceDelta = projected.balance - current.balance;

  const budgetImpact: BudgetImpact | null =
    budget.monthlyLimit != null && budget.monthlyLimit > 0
      ? {
          monthlyLimit: budget.monthlyLimit,
          currentUsedPercent: (current.expense / budget.monthlyLimit) * 100,
          projectedUsedPercent: (projected.expense / budget.monthlyLimit) * 100,
        }
      : null;

  const activeGoals = goals.filter((g) => computeGoalProgress(g, now).status !== 'completed');
  // Simplifying assumption (goals are manually funded, not auto-linked to transactions): any
  // projected monthly balance change is split evenly across active goals as extra contribution.
  const extraPerGoal = activeGoals.length > 0 ? balanceDelta / activeGoals.length : 0;

  const goalProjections: GoalProjection[] = activeGoals.map((goal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
    const elapsedMonths = monthsBetween(new Date(goal.createdAt), now);
    const currentMonthlyRate = goal.savedAmount / elapsedMonths;
    const projectedMonthlyRate = currentMonthlyRate + extraPerGoal;

    const currentEtaMonths = currentMonthlyRate > 0 ? remaining / currentMonthlyRate : null;
    const projectedEtaMonths = projectedMonthlyRate > 0 ? remaining / projectedMonthlyRate : null;
    const monthsSaved =
      currentEtaMonths !== null && projectedEtaMonths !== null ? currentEtaMonths - projectedEtaMonths : null;

    return {
      goalId: goal.id,
      name: goal.name,
      currentEtaMonths,
      projectedEtaMonths,
      monthsSaved,
    };
  });

  return { current, projected, balanceDelta, budgetImpact, goalProjections };
}
