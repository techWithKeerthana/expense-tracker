export const STORAGE_KEYS = {
  TRANSACTIONS: '@expense_tracker/transactions',
  DELETED_TRANSACTIONS: '@expense_tracker/deleted_transactions',
  BUDGET: '@expense_tracker/budget',
  GOALS: '@expense_tracker/goals',
  DELETED_GOALS: '@expense_tracker/deleted_goals',
  THEME_MODE: '@expense_tracker/theme_mode',
  PIN_ENABLED: '@expense_tracker/pin_enabled',
  SMART_IMPORT_ENABLED: '@expense_tracker/smart_import_enabled',
  PENDING_IMPORTS: '@expense_tracker/pending_imports',
} as const;

export const SECURE_STORE_KEYS = {
  PIN_CODE: 'expense_tracker_pin_code',
} as const;
