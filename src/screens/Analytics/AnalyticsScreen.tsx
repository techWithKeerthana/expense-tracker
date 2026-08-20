import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import {
  computeAverageSpending,
  computeCategoryBreakdown,
  computeMonthlyTrend,
  computeTotals,
} from '../../utils/calculations';
import { generateInsights } from '../../utils/insights';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_COLORS } from '../../constants/categories';
import { fontSize, radius, spacing } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2;

export function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const { transactions } = useTransactions();

  if (transactions.length === 0) {
    return (
      <ScreenContainer>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Analytics</Text>
        <EmptyState
          icon="analytics-outline"
          title="Not enough data yet"
          subtitle="Add a few transactions to unlock analytics and insights."
        />
      </ScreenContainer>
    );
  }

  const totals = computeTotals(transactions);
  const breakdown = computeCategoryBreakdown(transactions, 'expense');
  const trend = computeMonthlyTrend(transactions, 6);
  const average = computeAverageSpending(transactions);
  const insights = generateInsights(transactions);
  const highestCategory = breakdown[0];

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => (isDark ? `rgba(255,255,255,${opacity})` : `rgba(26,29,41,${opacity})`),
    labelColor: (opacity = 1) => (isDark ? `rgba(255,255,255,${opacity})` : `rgba(26,29,41,${opacity})`),
    decimalPlaces: 0,
    barPercentage: 0.6,
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Analytics</Text>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Highest Category</Text>
            <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
              {highestCategory ? highestCategory.category : 'N/A'}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Avg. Spending</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(average)}</Text>
          </Card>
        </View>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Transactions</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{transactions.length}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Net Balance</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(totals.balance)}</Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Smart Spending Insights</Text>
        {insights.map((insight) => (
          <Card key={insight.id} style={styles.insightCard}>
            <View
              style={[
                styles.insightDot,
                {
                  backgroundColor:
                    insight.tone === 'positive'
                      ? colors.success
                      : insight.tone === 'negative'
                        ? colors.danger
                        : insight.tone === 'warning'
                          ? colors.warning
                          : colors.textMuted,
                },
              ]}
            />
            <Text style={[styles.insightText, { color: colors.text }]}>{insight.message}</Text>
          </Card>
        ))}

        {pieData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Breakdown</Text>
            <Card>
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
          </View>
        )}

        <View style={styles.chartSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Income vs Expense</Text>
          <Card>
            <BarChart
              data={{
                labels: ['Income', 'Expense'],
                datasets: [{ data: [totals.income, totals.expense] }],
              }}
              width={screenWidth}
              height={200}
              chartConfig={chartConfig}
              fromZero
              yAxisLabel={'\u20B9'}
              yAxisSuffix=""
              style={{ borderRadius: radius.md }}
            />
          </Card>
        </View>

        <View style={styles.chartSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Spending Trend</Text>
          <Card>
            <LineChart
              data={{
                labels: trend.map((t) => t.label),
                datasets: [{ data: trend.map((t) => t.expense) }],
              }}
              width={screenWidth}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: radius.md }}
            />
          </Card>
        </View>
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
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  insightText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
});
