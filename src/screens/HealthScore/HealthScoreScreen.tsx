import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { useBudget } from '../../context/BudgetContext';
import { useGoals } from '../../context/GoalContext';
import { computeHealthScore, HealthScoreBand } from '../../utils/healthScore';
import { fontSize, radius, spacing } from '../../constants/theme';

const BAND_LABELS: Record<HealthScoreBand, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Needs Attention',
};

export function HealthScoreScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  const { budget } = useBudget();
  const { goals } = useGoals();
  const result = computeHealthScore(transactions, budget, goals);

  const bandColor = (band: HealthScoreBand) => {
    switch (band) {
      case 'excellent':
        return colors.success;
      case 'good':
        return colors.primary;
      case 'fair':
        return colors.warning;
      default:
        return colors.danger;
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Financial Health Score</Text>

        <Card style={[styles.scoreCard, { backgroundColor: bandColor(result.band) }]}>
          <Text style={[styles.scoreValue, { color: colors.primaryText }]}>{result.score}</Text>
          <Text style={[styles.scoreBand, { color: colors.primaryText }]}>{BAND_LABELS[result.band]}</Text>
          <Text style={[styles.scoreOutOf, { color: colors.primaryText }]}>out of 100</Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>What's contributing to this score</Text>
        {result.factors.length === 0 ? (
          <Card style={styles.factorCard}>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
              Add some transactions, a budget, or a savings goal to start seeing your health score breakdown.
            </Text>
          </Card>
        ) : (
          result.factors.map((factor) => (
            <Card key={factor.key} style={styles.factorCard}>
              <View style={styles.factorHeader}>
                <Text style={[styles.factorLabel, { color: colors.text }]}>{factor.label}</Text>
                <Text style={{ color: bandColor(factor.score >= 80 ? 'excellent' : factor.score >= 60 ? 'good' : factor.score >= 40 ? 'fair' : 'poor'), fontWeight: '700' }}>
                  {Math.round(factor.score)}
                </Text>
              </View>
              <View style={[styles.factorTrack, { backgroundColor: colors.surfaceAlt }]}>
                <View
                  style={[
                    styles.factorFill,
                    { width: `${Math.round(factor.score)}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs }}>
                {factor.detail}
              </Text>
            </Card>
          ))
        )}

        <Card style={styles.disclaimerCard}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, flex: 1 }}>
            This score is a simple, rule-based estimate from your savings rate, budget usage, spending
            consistency, and goal progress — not financial advice.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  scoreCard: {
    alignItems: 'center',
    borderWidth: 0,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreBand: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  scoreOutOf: {
    fontSize: fontSize.xs,
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  factorCard: {
    marginBottom: spacing.md,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  factorLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  factorTrack: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
