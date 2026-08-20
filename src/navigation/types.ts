import { NavigatorScreenParams } from '@react-navigation/native';
import { CategoryName, TransactionType } from '../types';

export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Summary: undefined;
  Analytics: undefined;
  Settings: undefined;
};

export interface TransactionPrefill {
  title: string;
  amount: string;
  type: TransactionType;
  category: CategoryName;
  date: string;
  notes?: string;
  pendingImportId?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  PinLock: undefined;
  CreatePin: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  AddEditTransaction: { transactionId?: string; prefill?: TransactionPrefill } | undefined;
  TransactionDetails: { transactionId: string };
  Budget: undefined;
  Appearance: undefined;
  ExportImport: undefined;
  ChangePin: { mode: 'change' | 'disable' } | undefined;
  SmartImport: undefined;
  AiAssistant: undefined;
  Goals: undefined;
  AddEditGoal: { goalId?: string } | undefined;
  AddGoalContribution: { goalId: string };
  HealthScore: undefined;
  WhatIfSimulator: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
