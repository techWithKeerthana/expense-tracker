import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/categories';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { fontSize, radius, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionDetails'>;

export function TransactionDetailsScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { transactions, deleteTransaction } = useTransactions();
  const transaction = transactions.find((t) => t.id === route.params.transactionId);

  if (!transaction) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.text }}>Transaction not found.</Text>
      </ScreenContainer>
    );
  }

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;
  const categoryColor = CATEGORY_COLORS[transaction.category];

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(transaction.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard}>
          <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}22` }]}>
            <Ionicons name={CATEGORY_ICONS[transaction.category]} size={28} color={categoryColor} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{transaction.title}</Text>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </Text>
        </Card>

        <Card style={styles.detailsCard}>
          <DetailRow label="Type" value={isIncome ? 'Income' : 'Expense'} />
          <DetailRow label="Category" value={transaction.category} />
          <DetailRow label="Date" value={formatDate(transaction.date)} />
          {transaction.notes ? <DetailRow label="Notes" value={transaction.notes} /> : null}
        </Card>

        {transaction.receiptUri ? (
          <Card style={styles.receiptCard}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Receipt</Text>
            <Image source={{ uri: transaction.receiptUri }} style={styles.receiptImage} />
          </Card>
        ) : null}

        <Button
          label="Edit Transaction"
          onPress={() => navigation.navigate('AddEditTransaction', { transactionId: transaction.id })}
        />
        <View style={{ marginTop: spacing.md }}>
          <Button label="Delete Transaction" variant="danger" onPress={handleDelete} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  amount: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  detailsCard: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.sm,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  receiptCard: {
    marginBottom: spacing.lg,
  },
  receiptLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  receiptImage: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
  },
});
