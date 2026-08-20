import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ProgressBar } from '../../components/ProgressBar';
import { SkeletonGroup } from '../../components/Skeleton';
import { useTheme } from '../../context/ThemeContext';
import { useGoals } from '../../context/GoalContext';
import { computeGoalProgress, GoalStatus } from '../../utils/goalProgress';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IoniconsName } from '../../constants/goalIcons';
import { fontSize, radius, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Goals'>;

const STATUS_LABELS: Record<GoalStatus, string> = {
  completed: 'Completed',
  overdue: 'Overdue',
  'on-track': 'On track',
  behind: 'Behind',
};

export function GoalsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { goals, isLoading } = useGoals();

  const statusColor = (status: GoalStatus) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'overdue':
        return colors.danger;
      case 'behind':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Financial Goals</Text>
        <Pressable
          onPress={() => navigation.navigate('AddEditGoal')}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={22} color={colors.primaryText} />
        </Pressable>
      </View>

      {isLoading ? (
        <SkeletonGroup rows={3} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="flag-outline"
              title="No goals yet"
              subtitle="Tap the + button to set your first savings goal — e.g. an emergency fund or a trip."
            />
          }
          renderItem={({ item }) => {
          const progress = computeGoalProgress(item);
          return (
            <Pressable onPress={() => navigation.navigate('AddEditGoal', { goalId: item.id })}>
              <Card style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}22` }]}>
                    <Ionicons name={item.icon as IoniconsName} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalName, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                      Target {formatDate(item.targetDate)}
                    </Text>
                  </View>
                  <Text style={[styles.statusBadge, { color: statusColor(progress.status) }]}>
                    {STATUS_LABELS[progress.status]}
                  </Text>
                </View>

                <View style={{ marginBottom: spacing.sm }}>
                  <ProgressBar progress={progress.percent / 100} color={statusColor(progress.status)} height={8} />
                </View>

                <View style={styles.goalFooter}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    {formatCurrency(item.savedAmount)} of {formatCurrency(item.targetAmount)}
                  </Text>
                  <Pressable
                    onPress={() => navigation.navigate('AddGoalContribution', { goalId: item.id })}
                    style={[styles.addFundsButton, { backgroundColor: colors.surfaceAlt }]}
                  >
                    <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' }}>
                      + Add Funds
                    </Text>
                  </Pressable>
                </View>
              </Card>
            </Pressable>
          );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCard: {
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalName: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  statusBadge: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addFundsButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
});
