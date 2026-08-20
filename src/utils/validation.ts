import { z } from 'zod';
import { CATEGORIES } from '../constants/categories';
import { isPasswordStrong, PASSWORD_REQUIREMENTS_MESSAGE } from './passwordStrength';

export const transactionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(60, 'Title must be under 60 characters'),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((v) => !Number.isNaN(Number(v)), 'Amount must be a number')
    .refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(300, 'Notes must be under 300 characters').optional(),
  receiptUri: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be under 80 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().refine(isPasswordStrong, PASSWORD_REQUIREMENTS_MESSAGE),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const goalSchema = z.object({
  name: z.string().trim().min(1, 'Goal name is required').max(80, 'Name must be under 80 characters'),
  icon: z.string().min(1, 'Icon is required'),
  targetAmount: z
    .string()
    .trim()
    .min(1, 'Target amount is required')
    .refine((v) => !Number.isNaN(Number(v)), 'Target amount must be a number')
    .refine((v) => Number(v) > 0, 'Target amount must be greater than 0'),
  targetDate: z.string().min(1, 'Target date is required'),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

export const contributionSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((v) => !Number.isNaN(Number(v)), 'Amount must be a number')
    .refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
});

export type ContributionFormValues = z.infer<typeof contributionSchema>;

