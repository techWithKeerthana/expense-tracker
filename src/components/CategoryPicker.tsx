import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CategoryName } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories';
import { fontSize, radius, spacing } from '../constants/theme';

interface CategoryPickerProps {
  value: CategoryName | 'all';
  onChange: (category: CategoryName | 'all') => void;
  includeAll?: boolean;
  categories?: CategoryName[];
}

export function CategoryPicker({ value, onChange, includeAll, categories }: CategoryPickerProps) {
  const { colors } = useTheme();
  const base = categories ?? CATEGORIES;
  const options: (CategoryName | 'all')[] = includeAll ? ['all', ...base] : base;

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={options}
      keyExtractor={(item) => item}
      contentContainerStyle={{ gap: spacing.sm }}
      renderItem={({ item }) => {
        const active = value === item;
        const color = item === 'all' ? colors.primary : CATEGORY_COLORS[item as CategoryName];
        return (
          <Pressable
            onPress={() => onChange(item)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? color : colors.surfaceAlt,
                borderColor: active ? color : colors.border,
              },
            ]}
          >
            {item !== 'all' && (
              <Ionicons
                name={CATEGORY_ICONS[item as CategoryName]}
                size={14}
                color={active ? colors.primaryText : colors.textSecondary}
              />
            )}
            <Text style={[styles.label, { color: active ? colors.primaryText : colors.textSecondary }]}>
              {item === 'all' ? 'All' : item}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
