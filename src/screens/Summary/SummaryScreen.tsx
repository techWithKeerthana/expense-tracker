import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { computeCategoryBreakdown, computeTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/categories';
import { fontSize, radius, spacing } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2;

export function SummaryScreen() {
  const { colors, isDark } = useTheme();
  const { transactions } = useTransactions();
  const totals = computeTotals(transactions);
  const breakdown = computeCategoryBreakdown(transactions, 'expense');

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => (isDark ? `rgba(255,255,255,${opacity})` : `rgba(26,29,41,${opacity})`),
    labelColor: (opacity = 1) => (isDark ? `rgba(255,255,255,${opacity})` : `rgba(26,29,41,${opacity})`),
    decimalPlaces: 0,
  };

  const pieData = breakdown.map((item) => ({
    name: item.category,
    population: item.total,
    color: CATEGORY_COLORS[item.category],
    legendFontColor: colors.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <ScreenContainer>
      <FlatList
        data={breakdown}
        keyExtractor={(item) => item.category}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={[styles.screenTitle, { color: colors.text }]}>Summary</Text>

            <View style={styles.statsRow}>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Income</Text>
                <Text style={[styles.statValue, { color: colors.income }]}>{formatCurrency(totals.income)}</Text>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expenses</Text>
                <Text style={[styles.statValue, { color: colors.expense }]}>{formatCurrency(totals.expense)}</Text>
              </Card>
            </View>
            <View style={styles.statsRow}>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Balance</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(totals.balance)}</Text>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Transactions</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{transactions.length}</Text>
              </Card>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense by Category</Text>
            {pieData.length > 0 && (
              <Card style={styles.chartCard}>
                <PieChart
                  data={pieData}
                  width={screenWidth}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="8"
                />
              </Card>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const percent = totals.expense > 0 ? (item.total / totals.expense) * 100 : 0;
          const color = CATEGORY_COLORS[item.category];
          return (
            <Card style={styles.categoryRow}>
              <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
                <Ionicons name={CATEGORY_ICONS[item.category]} size={18} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.categoryHeaderRow}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{item.category}</Text>
                  <Text style={[styles.categoryAmount, { color: colors.text }]}>{formatCurrency(item.total)}</Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
                  <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.percentLabel, { color: colors.textMuted }]}>{percent.toFixed(1)}%</Text>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="pie-chart-outline" title="No expenses yet" subtitle="Add transactions to see a category breakdown." />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  percentLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
