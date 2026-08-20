import { BudgetState, CategoryName, Transaction } from '../types';
import { CATEGORIES } from '../constants/categories';
import {
  computeAverageSpending,
  computeCategoryBreakdown,
  computeTotals,
  filterByMonth,
} from './calculations';
import { formatCurrency } from './formatters';

/**
 * Rule-based AI Financial Assistant — keyword/intent matching over local
 * transaction & budget data. No external API, no AI/ML, fully explainable
 * and offline, consistent with the existing Smart Insights engine.
 */

export type AssistantIntent =
  | 'balance'
  | 'income-total'
  | 'expense-total'
  | 'income-vs-expense'
  | 'category-spend'
  | 'highest-category'
  | 'budget-status'
  | 'trend-compare'
  | 'average-spend'
  | 'transaction-count'
  | 'unknown';

export type AssistantPeriod = 'this-month' | 'last-month' | 'all-time';

export interface AssistantAnswer {
  intent: AssistantIntent;
  message: string;
}

const PERIOD_LABELS: Record<AssistantPeriod, string> = {
  'this-month': 'this month',
  'last-month': 'last month',
  'all-time': 'overall',
};

export const SUGGESTED_QUESTIONS = [
  "What's my balance?",
  'How much did I spend on Food this month?',
  "What's my highest spending category?",
  'Am I over budget?',
  'Compare this month to last month',
];

export function detectPeriod(query: string): AssistantPeriod {
  const q = query.toLowerCase();
  if (q.includes('last month')) return 'last-month';
  if (q.includes('this month')) return 'this-month';
  return 'all-time';
}

export function detectCategory(query: string): CategoryName | null {
  const q = query.toLowerCase();
  for (const category of CATEGORIES) {
    if (q.includes(category.toLowerCase())) return category;
  }
  return null;
}

function transactionsForPeriod(transactions: Transaction[], period: AssistantPeriod): Transaction[] {
  if (period === 'all-time') return transactions;
  const now = new Date();
  const reference = period === 'last-month' ? new Date(now.getFullYear(), now.getMonth() - 1, 1) : now;
  return filterByMonth(transactions, reference);
}

export function detectIntent(query: string): AssistantIntent {
  const q = query.toLowerCase();
  const hasCategory = detectCategory(query) !== null;
  const mentionsIncome = q.includes('income') || q.includes('earn');
  const mentionsExpense = q.includes('expense') || q.includes('spend') || q.includes('spent');

  if (q.includes('budget')) return 'budget-status';
  // Checked before the generic "compare"/"vs" trend check below, since "income vs expense"
  // would otherwise be misread as a month-over-month trend comparison.
  if (mentionsIncome && mentionsExpense) return 'income-vs-expense';
  if ((q.includes('compare') || q.includes(' vs ') || q.includes('versus')) && q.includes('month')) {
    return 'trend-compare';
  }
  if ((q.includes('highest') || q.includes('biggest') || q.includes('most')) && q.includes('categor')) {
    return 'highest-category';
  }
  if (hasCategory && (q.includes('spend') || q.includes('spent') || q.includes('expense'))) {
    return 'category-spend';
  }
  if (q.includes('average')) return 'average-spend';
  if (
    q.includes('how many transaction') ||
    q.includes('number of transaction') ||
    q.includes('transaction count')
  ) {
    return 'transaction-count';
  }
  if (mentionsIncome) return 'income-total';
  if (mentionsExpense) return 'expense-total';
  if (q.includes('balance') || q.includes('how much money') || q.includes('net worth')) return 'balance';
  return 'unknown';
}

function unknownMessage(): string {
  return (
    "I'm not sure how to answer that yet. Try asking things like " +
    '"How much did I spend on Food this month?", "Am I over budget?", ' +
    '"What\'s my highest spending category?", or "Compare this month to last month".'
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function budgetStatusMessage(transactions: Transaction[], budget: BudgetState, query: string): string {
  const category = detectCategory(query);
  const now = new Date();
  const thisMonthTx = filterByMonth(transactions, now);
  const totals = computeTotals(thisMonthTx);

  if (category) {
    const categoryBudget = budget.categoryBudgets.find((c) => c.category === category);
    if (!categoryBudget) {
      return `You haven't set a budget for ${category} yet. You can set one in Settings → Budget Management.`;
    }
    const breakdown = computeCategoryBreakdown(thisMonthTx, 'expense');
    const spent = breakdown.find((b) => b.category === category)?.total ?? 0;
    const remaining = categoryBudget.limit - spent;
    return remaining >= 0
      ? `You've spent ${formatCurrency(spent)} of your ${formatCurrency(categoryBudget.limit)} ${category} budget this month — ${formatCurrency(remaining)} left.`
      : `You're over your ${category} budget this month by ${formatCurrency(Math.abs(remaining))} (spent ${formatCurrency(spent)} of ${formatCurrency(categoryBudget.limit)}).`;
  }

  if (budget.monthlyLimit == null) {
    return "You haven't set a monthly budget yet. You can set one in Settings → Budget Management.";
  }
  const remaining = budget.monthlyLimit - totals.expense;
  return remaining >= 0
    ? `You've spent ${formatCurrency(totals.expense)} of your ${formatCurrency(budget.monthlyLimit)} monthly budget — ${formatCurrency(remaining)} left this month.`
    : `You're over your monthly budget by ${formatCurrency(Math.abs(remaining))} (spent ${formatCurrency(totals.expense)} of ${formatCurrency(budget.monthlyLimit)}).`;
}

export function answerFinancialQuery(
  query: string,
  transactions: Transaction[],
  budget: BudgetState
): AssistantAnswer {
  const intent = detectIntent(query);
  const period = detectPeriod(query);
  const scoped = transactionsForPeriod(transactions, period);
  const periodLabel = PERIOD_LABELS[period];

  switch (intent) {
    case 'balance': {
      const totals = computeTotals(scoped);
      return {
        intent,
        message: `Your balance ${periodLabel} is ${formatCurrency(totals.balance)} (income ${formatCurrency(totals.income)} minus expenses ${formatCurrency(totals.expense)}).`,
      };
    }
    case 'income-total': {
      const totals = computeTotals(scoped);
      return { intent, message: `You earned ${formatCurrency(totals.income)} ${periodLabel}.` };
    }
    case 'expense-total': {
      const totals = computeTotals(scoped);
      return { intent, message: `You spent ${formatCurrency(totals.expense)} ${periodLabel}.` };
    }
    case 'income-vs-expense': {
      const totals = computeTotals(scoped);
      const diff = totals.income - totals.expense;
      const comparison =
        diff > 0
          ? `${formatCurrency(diff)} more than you spent`
          : diff < 0
            ? `${formatCurrency(Math.abs(diff))} less than you spent`
            : 'exactly what you spent';
      return {
        intent,
        message: `${capitalize(periodLabel)}, you earned ${formatCurrency(totals.income)} and spent ${formatCurrency(totals.expense)} — that's ${comparison}.`,
      };
    }
    case 'category-spend': {
      const category = detectCategory(query);
      if (!category) {
        return { intent: 'unknown', message: unknownMessage() };
      }
      const breakdown = computeCategoryBreakdown(scoped, 'expense');
      const amount = breakdown.find((b) => b.category === category)?.total ?? 0;
      return {
        intent,
        message:
          amount > 0
            ? `You spent ${formatCurrency(amount)} on ${category} ${periodLabel}.`
            : `You haven't spent anything on ${category} ${periodLabel}.`,
      };
    }
    case 'highest-category': {
      const breakdown = computeCategoryBreakdown(scoped, 'expense');
      if (breakdown.length === 0) {
        return { intent, message: `You don't have any expenses recorded ${periodLabel} yet.` };
      }
      const top = breakdown[0];
      return {
        intent,
        message: `Your highest spending category ${periodLabel} is ${top.category} at ${formatCurrency(top.total)}.`,
      };
    }
    case 'budget-status':
      return { intent, message: budgetStatusMessage(transactions, budget, query) };
    case 'trend-compare': {
      const now = new Date();
      const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisTotals = computeTotals(filterByMonth(transactions, now));
      const lastTotals = computeTotals(filterByMonth(transactions, lastMonthRef));
      const diff = thisTotals.expense - lastTotals.expense;
      if (lastTotals.expense === 0 && thisTotals.expense === 0) {
        return { intent, message: "There's no expense data for this month or last month yet." };
      }
      if (diff === 0) {
        return {
          intent,
          message: `Your spending this month (${formatCurrency(thisTotals.expense)}) is the same as last month.`,
        };
      }
      const pct = lastTotals.expense > 0 ? Math.round((Math.abs(diff) / lastTotals.expense) * 100) : null;
      const direction = diff > 0 ? 'more' : 'less';
      return {
        intent,
        message: `You spent ${formatCurrency(Math.abs(diff))} ${direction} this month (${formatCurrency(thisTotals.expense)}) than last month (${formatCurrency(lastTotals.expense)})${pct !== null ? ` — that's ${pct}% ${direction}` : ''}.`,
      };
    }
    case 'average-spend': {
      const avg = computeAverageSpending(scoped);
      return {
        intent,
        message:
          avg > 0
            ? `Your average expense ${periodLabel} is ${formatCurrency(avg)}.`
            : `You don't have any expenses ${periodLabel} to average.`,
      };
    }
    case 'transaction-count':
      return {
        intent,
        message: `You have ${scoped.length} transaction${scoped.length === 1 ? '' : 's'} recorded ${periodLabel}.`,
      };
    default:
      return { intent: 'unknown', message: unknownMessage() };
  }
}
