import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Transaction } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import { fontSize, radius, spacing } from '../constants/theme';

interface TransactionListItemProps {
  transaction: Transaction;
  onPress: () => void;
}

export function TransactionListItem({ transaction, onPress }: TransactionListItemProps) {
  const { colors } = useTheme();
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;
  const categoryColor = CATEGORY_COLORS[transaction.category];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}22` }]}>
        <Ionicons name={CATEGORY_ICONS[transaction.category]} size={20} color={categoryColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {transaction.category} • {formatDateShort(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {isIncome ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  meta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
