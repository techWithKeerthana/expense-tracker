import React, { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';
import { TransactionListItem } from '../../components/TransactionListItem';
import { CategoryPicker } from '../../components/CategoryPicker';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { CategoryName, SortOption, TransactionType } from '../../types';
import { fontSize, radius, spacing } from '../../constants/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Transactions'>,
  NativeStackScreenProps<RootStackParamList>
>;

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Latest', value: 'latest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Highest', value: 'highest' },
];

const TYPE_OPTIONS: { label: string; value: TransactionType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

export function TransactionListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { transactions } = useTransactions();

  const [search, setSearch] = useState('');
  const [type, setType] = useState<TransactionType | 'all'>('all');
  const [category, setCategory] = useState<CategoryName | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('latest');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);

  const filtered = useMemo(() => {
    let result = transactions.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesType = type === 'all' || t.type === type;
      const matchesCategory = category === 'all' || t.category === category;
      const txDate = new Date(t.date);
      const matchesStart = !startDate || txDate >= startDate;
      const matchesEnd = !endDate || txDate <= endDate;
      return matchesSearch && matchesType && matchesCategory && matchesStart && matchesEnd;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'highest') return b.amount - a.amount;
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sort === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [transactions, search, type, category, sort, startDate, endDate]);

  const clearFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setSort('latest');
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <ScreenContainer>
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by title"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <Pressable
          onPress={() => setShowFilters((s) => !s)}
          style={[styles.filterButton, { backgroundColor: showFilters ? colors.primary : colors.surfaceAlt }]}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? colors.primaryText : colors.text} />
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <CategoryPicker value={category} onChange={setCategory} includeAll />
          <View style={styles.chipRow}>
            {TYPE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setType(opt.value)}
                style={[
                  styles.smallChip,
                  {
                    backgroundColor: type === opt.value ? colors.primary : colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ color: type === opt.value ? colors.primaryText : colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setSort(opt.value)}
                style={[
                  styles.smallChip,
                  {
                    backgroundColor: sort === opt.value ? colors.primary : colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ color: sort === opt.value ? colors.primaryText : colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setPickerTarget('start')}
              style={[styles.smallChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                From: {startDate ? startDate.toDateString() : 'Any'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPickerTarget('end')}
              style={[styles.smallChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                To: {endDate ? endDate.toDateString() : 'Any'}
              </Text>
            </Pressable>
            <Pressable onPress={clearFilters} style={styles.smallChip}>
              <Text style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: '600' }}>Clear all</Text>
            </Pressable>
          </View>
          {pickerTarget && (
            <DateTimePicker
              value={(pickerTarget === 'start' ? startDate : endDate) ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, selected) => {
                if (selected) {
                  if (pickerTarget === 'start') setStartDate(selected);
                  else setEndDate(selected);
                }
                // Android auto-dismisses; iOS inline stays open until "Done" is tapped below.
                if (Platform.OS !== 'ios') setPickerTarget(null);
              }}
            />
          )}
          {pickerTarget && Platform.OS === 'ios' && (
            <Pressable
              onPress={() => setPickerTarget(null)}
              style={[styles.smallChip, { backgroundColor: colors.primary, alignSelf: 'flex-start' }]}
            >
              <Text style={{ color: colors.primaryText, fontSize: fontSize.xs, fontWeight: '600' }}>Done</Text>
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.md }}
        renderItem={({ item }) => (
          <TransactionListItem
            transaction={item}
            onPress={() => navigation.navigate('TransactionDetails', { transactionId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No transactions found"
            subtitle="Try adjusting your search or filters."
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersPanel: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  smallChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
