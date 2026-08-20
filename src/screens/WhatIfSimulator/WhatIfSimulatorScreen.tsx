import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { CategoryPicker } from '../../components/CategoryPicker';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { useBudget } from '../../context/BudgetContext';
import { useGoals } from '../../context/GoalContext';
import { computeWhatIf } from '../../utils/whatIfSimulator';
import { formatCurrency } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { CategoryName } from '../../types';
import { fontSize, radius, spacing } from '../../constants/theme';

function formatMonths(months: number | null): string {
  if (months === null) return 'Not enough data yet';
  if (months < 1) return 'Less than a month';
  return `${months.toFixed(1)} months`;
}

export function WhatIfSimulatorScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  const { budget } = useBudget();
  const { goals } = useGoals();

  const [category, setCategory] = useState<CategoryName>(EXPENSE_CATEGORIES[0]);
  const [percentText, setPercentText] = useState('-10');
  const [extraIncomeText, setExtraIncomeText] = useState('0');

  const percent = Number(percentText) || 0;
  const extraIncome = Number(extraIncomeText) || 0;

  const result = useMemo(
    () =>
      computeWhatIf(
        transactions,
        budget,
        goals,
        { categoryAdjustments: { [category]: percent }, extraMonthlyIncome: extraIncome },
        new Date()
      ),
    [transactions, budget, goals, category, percent, extraIncome]
  );

  const balanceImproved = result.balanceDelta >= 0;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>What-If Simulator</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Try a hypothetical change and see the projected impact — nothing here is saved.
        </Text>

        <Card style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Adjust spending in category</Text>
          <CategoryPicker
            value={category}
            onChange={(c) => c !== 'all' && setCategory(c)}
            categories={EXPENSE_CATEGORIES}
          />
          <InputField
            label="Percent change (negative to cut, positive to increase)"
            placeholder="-20"
            keyboardType="numbers-and-punctuation"
            value={percentText}
            onChangeText={setPercentText}
            containerStyle={{ marginTop: spacing.md, marginBottom: 0 }}
          />
        </Card>

        <Card style={styles.section}>
          <InputField
            label="Extra monthly income"
            placeholder="0"
            keyboardType="numbers-and-punctuation"
            value={extraIncomeText}
            onChangeText={setExtraIncomeText}
            containerStyle={{ marginBottom: 0 }}
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Projected impact this month</Text>
        <Card style={styles.section}>
          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>Balance</Text>
            <Text style={{ color: colors.text }}>
              {formatCurrency(result.current.balance)} → {formatCurrency(result.projected.balance)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>Change</Text>
            <Text style={{ color: balanceImproved ? colors.success : colors.danger, fontWeight: '700' }}>
              {balanceImproved ? '+' : ''}
              {formatCurrency(result.balanceDelta)}
            </Text>
          </View>
        </Card>

        {result.budgetImpact && (
          <Card style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Monthly budget usage</Text>
            <View style={styles.row}>
              <Text style={{ color: colors.text }}>Now</Text>
              <Text style={{ color: colors.text }}>{Math.round(result.budgetImpact.currentUsedPercent)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ color: colors.text }}>Projected</Text>
              <Text
                style={{
                  color: result.budgetImpact.projectedUsedPercent <= 100 ? colors.success : colors.danger,
                  fontWeight: '700',
                }}
              >
                {Math.round(result.budgetImpact.projectedUsedPercent)}%
              </Text>
            </View>
          </Card>
        )}

        {result.goalProjections.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goal completion estimates</Text>
            {result.goalProjections.map((projection) => (
              <Card key={projection.goalId} style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>{projection.name}</Text>
                <View style={styles.row}>
                  <Text style={{ color: colors.textSecondary }}>Current pace</Text>
                  <Text style={{ color: colors.text }}>{formatMonths(projection.currentEtaMonths)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{ color: colors.textSecondary }}>With this change</Text>
                  <Text style={{ color: colors.text }}>{formatMonths(projection.projectedEtaMonths)}</Text>
                </View>
                {projection.monthsSaved !== null && (
                  <Text
                    style={{
                      color: projection.monthsSaved > 0 ? colors.success : colors.textMuted,
                      fontSize: fontSize.xs,
                      marginTop: spacing.xs,
                    }}
                  >
                    {projection.monthsSaved > 0
                      ? `Reaches the goal about ${projection.monthsSaved.toFixed(1)} months sooner.`
                      : 'No meaningful change to this goal.'}
                  </Text>
                )}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
});
