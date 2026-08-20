import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import { CategoryName } from '../types';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export const CATEGORIES: CategoryName[] = [
  'Salary',
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other',
];

export const CATEGORY_ICONS: Record<CategoryName, IoniconsName> = {
  Salary: 'cash-outline',
  Food: 'fast-food-outline',
  Travel: 'airplane-outline',
  Shopping: 'cart-outline',
  Bills: 'receipt-outline',
  Entertainment: 'film-outline',
  Other: 'ellipsis-horizontal-circle-outline',
};

export const CATEGORY_COLORS: Record<CategoryName, string> = {
  Salary: '#2E9E5B',
  Food: '#E67E22',
  Travel: '#2E86DE',
  Shopping: '#8E44AD',
  Bills: '#C0392B',
  Entertainment: '#D35400',
  Other: '#7F8C8D',
};

export const INCOME_CATEGORIES: CategoryName[] = ['Salary', 'Other'];
export const EXPENSE_CATEGORIES: CategoryName[] = CATEGORIES.filter((c) => c !== 'Salary');
