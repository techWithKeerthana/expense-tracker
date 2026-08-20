import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { ProgressBar } from '../../components/ProgressBar';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { useBudget } from '../../context/BudgetContext';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/categories';
import { filterByMonth } from '../../utils/calculations';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { CategoryName } from '../../types';
import { fontSize, radius, spacing } from '../../constants/theme';

export function BudgetScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  const { budget, setMonthlyLimit, setCategoryBudget, removeCategoryBudget } = useBudget();

  const now = new Date();
  const thisMonthExpenses = useMemo(
    () => filterByMonth(transactions, now).filter((t) => t.type === 'expense'),
    [transactions]
  );
  const totalSpent = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const [monthlyInput, setMonthlyInput] = useState(budget.monthlyLimit ? String(budget.monthlyLimit) : '');
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>(
    Object.fromEntries(budget.categoryBudgets.map((c) => [c.category, String(c.limit)]))
  );

  const spentByCategory = (category: CategoryName) =>
    thisMonthExpenses.filter((t) => t.category === category).reduce((sum, t) => sum + t.amount, 0);

  const saveMonthlyLimit = async () => {
    const value = Number(monthlyInput);
    if (monthlyInput.trim() === '') {
      await setMonthlyLimit(null);
      return;
    }
    if (Number.isNaN(value) || value <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid monthly budget amount.');
      return;
    }
    await setMonthlyLimit(value);
  };

  const saveCategoryLimit = async (category: CategoryName) => {
    const raw = categoryInputs[category];
    if (!raw || raw.trim() === '') {
      await removeCategoryBudget(category);
      return;
    }
    const value = Number(raw);
    if (Number.isNaN(value) || value <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid budget amount.');
      return;
    }
    await setCategoryBudget({ category, limit: value });
  };

  const monthlyProgress = budget.monthlyLimit ? totalSpent / budget.monthlyLimit : 0;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Budget — {formatMonthYear(now)}</Text>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Budget</Text>
          <InputField
            label="Monthly limit"
            placeholder="e.g. 20000"
            keyboardType="decimal-pad"
            value={monthlyInput}
            onChangeText={setMonthlyInput}
            onBlur={saveMonthlyLimit}
          />
          {budget.monthlyLimit ? (
            <View>
              <View style={styles.progressLabelRow}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                  Spent {formatCurrency(totalSpent)} of {formatCurrency(budget.monthlyLimit)}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                  {Math.round(monthlyProgress * 100)}%
                </Text>
              </View>
              <ProgressBar progress={monthlyProgress} />
              {monthlyProgress >= 1 ? (
                <Text style={[styles.warningText, { color: colors.danger }]}>
                  You've exceeded your monthly budget!
                </Text>
              ) : monthlyProgress >= 0.8 ? (
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  You're close to your monthly limit.
                </Text>
              ) : null}
            </View>
          ) : null}
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Budgets</Text>
          {CATEGORIES.map((category) => {
            const limit = Number(categoryInputs[category] ?? '');
            const spent = spentByCategory(category);
            const progress = limit > 0 ? spent / limit : 0;
            const color = CATEGORY_COLORS[category];
            return (
              <View key={category} style={styles.categoryBlock}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
                    <Ionicons name={CATEGORY_ICONS[category]} size={16} color={color} />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
                </View>
                <InputField
                  label=""
                  placeholder="No limit set"
                  keyboardType="decimal-pad"
                  value={categoryInputs[category] ?? ''}
                  onChangeText={(v) => setCategoryInputs((prev) => ({ ...prev, [category]: v }))}
                  onBlur={() => saveCategoryLimit(category)}
                  containerStyle={{ marginBottom: 0 }}
                />
                {limit > 0 && (
                  <View style={{ marginTop: spacing.xs }}>
                    <ProgressBar progress={progress} />
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 4 }}>
                      {formatCurrency(spent)} of {formatCurrency(limit)}
                      {progress >= 1 ? ' — limit exceeded' : progress >= 0.8 ? ' — near limit' : ''}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  categoryBlock: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
