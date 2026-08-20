import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TransactionType } from '../types';
import { fontSize, radius, spacing } from '../constants/theme';

interface TypeToggleProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      {(['expense', 'income'] as TransactionType[]).map((type) => {
        const active = value === type;
        const activeColor = type === 'income' ? colors.income : colors.expense;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={[
              styles.segment,
              active && { backgroundColor: activeColor },
            ]}
          >
            <Text style={[styles.label, { color: active ? colors.primaryText : colors.textSecondary }]}>
              {type === 'income' ? 'Income' : 'Expense'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 4,
    marginBottom: spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
