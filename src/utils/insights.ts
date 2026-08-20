import { Transaction } from '../types';
import { computeCategoryBreakdown, computeTotals, filterByMonth } from './calculations';
import { formatCurrency } from './formatters';

export interface Insight {
  id: string;
  message: string;
  tone: 'positive' | 'negative' | 'neutral' | 'warning';
}

/**
 * Rule-based insight engine — compares the current month against the
 * previous month to surface simple, explainable spending observations.
 * No AI/ML involved.
 */
export function generateInsights(transactions: Transaction[]): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthTx = filterByMonth(transactions, now);
  const lastMonthTx = filterByMonth(transactions, lastMonthRef);

  if (thisMonthTx.length === 0 && lastMonthTx.length === 0) {
    return [
      {
        id: 'no-data',
        message: 'Add some transactions to start seeing personalized spending insights.',
        tone: 'neutral',
      },
    ];
  }

  const thisTotals = computeTotals(thisMonthTx);
  const lastTotals = computeTotals(lastMonthTx);

  if (lastTotals.expense > 0) {
    const diff = thisTotals.expense - lastTotals.expense;
    const pct = Math.round((Math.abs(diff) / lastTotals.expense) * 100);
    if (diff > 0) {
      insights.push({
        id: 'expense-increase',
        message: `Expenses increased by ${pct}% (${formatCurrency(diff)}) compared to last month.`,
        tone: 'negative',
      });
    } else if (diff < 0) {
      insights.push({
        id: 'expense-decrease',
        message: `Nice! Expenses decreased by ${pct}% (${formatCurrency(Math.abs(diff))}) compared to last month.`,
        tone: 'positive',
      });
    } else {
      insights.push({
        id: 'expense-same',
        message: `Your expenses are about the same as last month.`,
        tone: 'neutral',
      });
    }
  }

  const thisBreakdown = computeCategoryBreakdown(thisMonthTx, 'expense');
  const lastBreakdown = computeCategoryBreakdown(lastMonthTx, 'expense');

  if (thisBreakdown.length > 0) {
    const top = thisBreakdown[0];
    insights.push({
      id: 'top-category',
      message: `${top.category} is your highest spending category this month at ${formatCurrency(top.total)}.`,
      tone: 'warning',
    });

    const lastForTop = lastBreakdown.find((c) => c.category === top.category);
    if (lastForTop) {
      const catDiff = top.total - lastForTop.total;
      if (Math.abs(catDiff) > 0) {
        insights.push({
          id: 'category-diff',
          message: `You spent ${formatCurrency(Math.abs(catDiff))} ${catDiff > 0 ? 'more' : 'less'} on ${top.category} this month.`,
          tone: catDiff > 0 ? 'negative' : 'positive',
        });
      }
    }
  }

  if (thisTotals.income > 0 && thisTotals.expense > thisTotals.income) {
    insights.push({
      id: 'overspending',
      message: `You're spending more than you're earning this month. Consider reviewing your budget.`,
      tone: 'negative',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'steady',
      message: 'Your spending looks steady this month. Keep it up!',
      tone: 'positive',
    });
  }

  return insights;
}
