import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { TransactionListItem } from '../../components/TransactionListItem';
import { SyncStatusBadge } from '../../components/SyncStatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { computeTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { fontSize, radius, spacing } from '../../constants/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function DashboardScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { transactions, isLoading } = useTransactions();
  const totals = computeTotals(transactions);
  const recent = transactions.slice(0, 5);

  return (
    <ScreenContainer>
      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back</Text>
                <Text style={[styles.appName, { color: colors.text }]}>Expense Tracker</Text>
                <View style={{ marginTop: spacing.xs }}>
                  <SyncStatusBadge />
                </View>
              </View>
              <Pressable
                onPress={() => navigation.navigate('AddEditTransaction')}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={24} color={colors.primaryText} />
              </Pressable>
            </View>

            <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
              <Text style={[styles.balanceLabel, { color: colors.primaryText }]}>Total Balance</Text>
              <Text style={[styles.balanceValue, { color: colors.primaryText }]}>
                {formatCurrency(totals.balance)}
              </Text>
              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <Ionicons name="arrow-down-circle" size={18} color={colors.primaryText} />
                  <View>
                    <Text style={[styles.balanceItemLabel, { color: colors.primaryText }]}>Income</Text>
                    <Text style={[styles.balanceItemValue, { color: colors.primaryText }]}>
                      {formatCurrency(totals.income)}
                    </Text>
                  </View>
                </View>
                <View style={styles.balanceItem}>
                  <Ionicons name="arrow-up-circle" size={18} color={colors.primaryText} />
                  <View>
                    <Text style={[styles.balanceItemLabel, { color: colors.primaryText }]}>Expenses</Text>
                    <Text style={[styles.balanceItemValue, { color: colors.primaryText }]}>
                      {formatCurrency(totals.expense)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
              <Pressable onPress={() => navigation.navigate('Main', { screen: 'Transactions' })}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TransactionListItem
            transaction={item}
            onPress={() => navigation.navigate('TransactionDetails', { transactionId: item.id })}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="wallet-outline"
              title="No transactions yet"
              subtitle="Tap the + button to add your first income or expense."
            />
          ) : null
        }
      />
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
  greeting: {
    fontSize: fontSize.sm,
  },
  appName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    marginBottom: spacing.xl,
    borderWidth: 0,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    opacity: 0.85,
  },
  balanceValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  balanceItemLabel: {
    fontSize: fontSize.xs,
    opacity: 0.85,
  },
  balanceItemValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
