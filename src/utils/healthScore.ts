import { BudgetState, Goal, Transaction } from '../types';
import { computeMonthlyTrend, computeTotals, filterByMonth } from './calculations';
import { computeGoalProgress } from './goalProgress';

/**
 * Rule-based Financial Health Score — combines savings rate, budget
 * adherence, spending consistency, and goal progress into a single
 * explainable 0-100 score. No AI/ML; every factor is a plain formula and
 * is skipped (and its weight redistributed) when there isn't enough data
 * to compute it meaningfully.
 */

export type HealthScoreBand = 'excellent' | 'good' | 'fair' | 'poor';

export interface HealthScoreFactor {
  key: 'savings' | 'budget' | 'consistency' | 'goals';
  label: string;
  score: number; // 0-100
  weight: number; // the factor's share of the overall score (renormalized), 0-1
  detail: string;
}

export interface HealthScoreResult {
  score: number; // 0-100, or 50 ("fair", neutral) when no factors have enough data
  band: HealthScoreBand;
  factors: HealthScoreFactor[];
}

const BASE_WEIGHTS: Record<HealthScoreFactor['key'], number> = {
  savings: 0.35,
  budget: 0.25,
  consistency: 0.2,
  goals: 0.2,
};

const LABELS: Record<HealthScoreFactor['key'], string> = {
  savings: 'Savings Rate',
  budget: 'Budget Adherence',
  consistency: 'Spending Consistency',
  goals: 'Goal Progress',
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface RawFactor {
  included: boolean;
  score: number;
  detail: string;
}

function savingsFactor(transactions: Transaction[], now: Date): RawFactor {
  const totals = computeTotals(filterByMonth(transactions, now));
  if (totals.income <= 0) {
    return { included: false, score: 0, detail: 'No income recorded this month yet.' };
  }
  const savingsRate = (totals.income - totals.expense) / totals.income;
  const score = clamp(((savingsRate + 0.5) / 1) * 100, 0, 100);
  const pct = Math.round(savingsRate * 100);
  const detail =
    pct >= 0
      ? `You saved ${pct}% of your income this month.`
      : `You spent ${Math.abs(pct)}% more than you earned this month.`;
  return { included: true, score, detail };
}

function budgetFactor(transactions: Transaction[], budget: BudgetState, now: Date): RawFactor {
  if (budget.monthlyLimit == null || budget.monthlyLimit <= 0) {
    return { included: false, score: 0, detail: 'No monthly budget set.' };
  }
  const totals = computeTotals(filterByMonth(transactions, now));
  const usedRatio = totals.expense / budget.monthlyLimit;
  const score = usedRatio <= 1 ? 100 - usedRatio * 30 : Math.max(0, 70 - (usedRatio - 1) * 100);
  const pct = Math.round(usedRatio * 100);
  const detail =
    usedRatio <= 1
      ? `You've used ${pct}% of your monthly budget so far.`
      : `You're ${pct - 100}% over your monthly budget.`;
  return { included: true, score, detail };
}

function consistencyFactor(transactions: Transaction[]): RawFactor {
  const trend = computeMonthlyTrend(transactions, 3);
  const expenses = trend.map((t) => t.expense).filter((e) => e > 0);
  if (expenses.length < 2) {
    return { included: false, score: 0, detail: 'Not enough months of spending data yet.' };
  }
  const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length;
  const variance = expenses.reduce((a, b) => a + (b - mean) ** 2, 0) / expenses.length;
  const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const score = clamp(100 - coefficientOfVariation * 100, 0, 100);
  const detail = `Your monthly spending has varied by about ${Math.round(coefficientOfVariation * 100)}% over the last ${expenses.length} months.`;
  return { included: true, score, detail };
}

function goalsFactor(goals: Goal[], now: Date): RawFactor {
  if (goals.length === 0) {
    return { included: false, score: 0, detail: 'No financial goals set yet.' };
  }
  const percents = goals.map((g) => computeGoalProgress(g, now).percent);
  const average = percents.reduce((a, b) => a + b, 0) / percents.length;
  const detail = `You're averaging ${Math.round(average)}% progress across ${goals.length} goal${goals.length === 1 ? '' : 's'}.`;
  return { included: true, score: average, detail };
}

function bandFor(score: number): HealthScoreBand {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

export function computeHealthScore(
  transactions: Transaction[],
  budget: BudgetState,
  goals: Goal[],
  now: Date = new Date()
): HealthScoreResult {
  const raw: Record<HealthScoreFactor['key'], RawFactor> = {
    savings: savingsFactor(transactions, now),
    budget: budgetFactor(transactions, budget, now),
    consistency: consistencyFactor(transactions),
    goals: goalsFactor(goals, now),
  };

  const includedKeys = (Object.keys(raw) as HealthScoreFactor['key'][]).filter((key) => raw[key].included);
  const totalWeight = includedKeys.reduce((sum, key) => sum + BASE_WEIGHTS[key], 0);

  if (totalWeight === 0) {
    return {
      score: 50,
      band: 'fair',
      factors: (Object.keys(raw) as HealthScoreFactor['key'][]).map((key) => ({
        key,
        label: LABELS[key],
        score: 0,
        weight: 0,
        detail: raw[key].detail,
      })),
    };
  }

  const factors: HealthScoreFactor[] = includedKeys.map((key) => ({
    key,
    label: LABELS[key],
    score: raw[key].score,
    weight: BASE_WEIGHTS[key] / totalWeight,
    detail: raw[key].detail,
  }));

  const score = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));

  return { score, band: bandFor(score), factors };
}
