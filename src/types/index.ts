export type TransactionType = 'income' | 'expense';

export type CategoryName =
  | 'Salary'
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryName;
  date: string; // ISO string
  notes?: string;
  receiptUri?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CategoryBudget {
  category: CategoryName;
  limit: number;
}

export interface BudgetState {
  monthlyLimit: number | null;
  categoryBudgets: CategoryBudget[];
  updatedAt?: string;
}

export type SortOption = 'latest' | 'oldest' | 'highest';

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
  category: CategoryName | 'all';
  startDate: string | null;
  endDate: string | null;
  sort: SortOption;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  targetDate: string;
  savedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export type GoalInput = Pick<Goal, 'name' | 'icon' | 'targetAmount' | 'targetDate'>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

