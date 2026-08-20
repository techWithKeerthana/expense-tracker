import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { TypeToggle } from '../../components/TypeToggle';
import { CategoryPicker } from '../../components/CategoryPicker';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { transactionSchema, TransactionFormValues } from '../../utils/validation';
import { CategoryName, TransactionType } from '../../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import { pendingImportStorage } from '../../storage/pendingImportStorage';
import { fontSize, radius, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditTransaction'>;

export function AddEditTransactionScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const transactionId = route.params?.transactionId;
  const prefill = route.params?.prefill;
  const existing = transactionId ? transactions.find((t) => t.id === transactionId) : undefined;
  const isEditing = Boolean(existing);
  const isReviewingImport = Boolean(prefill) && !isEditing;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: existing?.title ?? prefill?.title ?? '',
      amount: existing ? String(existing.amount) : prefill?.amount ?? '',
      type: existing?.type ?? prefill?.type ?? 'expense',
      category: existing?.category ?? prefill?.category ?? 'Food',
      date: existing?.date ?? prefill?.date ?? new Date().toISOString(),
      notes: existing?.notes ?? prefill?.notes ?? '',
      receiptUri: existing?.receiptUri,
    },
  });

  const type = watch('type');
  const category = watch('category');
  const date = watch('date');
  const receiptUri = watch('receiptUri');

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Transaction' : isReviewingImport ? 'Review Detected Transaction' : 'Add Transaction' });
  }, [navigation, isEditing, isReviewingImport]);

  useEffect(() => {
    if (type === 'income' && !INCOME_CATEGORIES.includes(category as CategoryName)) {
      setValue('category', 'Salary');
    }
  }, [type, category, setValue]);

  const onSubmit = async (values: TransactionFormValues) => {
    setSubmitting(true);
    try {
      const input = {
        title: values.title.trim(),
        amount: Number(values.amount),
        type: values.type as TransactionType,
        category: values.category as CategoryName,
        date: values.date,
        notes: values.notes?.trim() || undefined,
        receiptUri: values.receiptUri,
      };
      if (isEditing && transactionId) {
        await updateTransaction(transactionId, input);
      } else {
        await addTransaction(input);
        if (prefill?.pendingImportId) {
          await pendingImportStorage.remove(prefill.pendingImportId);
        }
      }
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!transactionId) return;
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(transactionId);
          navigation.goBack();
        },
      },
    ]);
  };

  const pickImage = async (fromCamera: boolean) => {
    if (fromCamera && Platform.OS === 'web') {
      Alert.alert('Camera unavailable', 'Camera capture requires a native device build. Use Gallery on web.');
      return;
    }
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          permission.canAskAgain
            ? `Please grant ${fromCamera ? 'camera' : 'photo library'} permission to attach a receipt photo.`
            : `${fromCamera ? 'Camera' : 'Photo library'} access is disabled. Enable it for this app in your device Settings to attach a receipt photo.`
        );
        return;
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
      if (!result.canceled && result.assets?.[0]) {
        setValue('receiptUri', result.assets[0].uri);
      }
    } catch {
      Alert.alert('Something went wrong', 'Could not open the camera or photo library. Please try again.');
    }
  };

  const categoryOptions = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isReviewingImport && (
          <View style={[styles.importBanner, { backgroundColor: `${colors.primary}18`, borderColor: colors.primary }]}>
            <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
            <Text style={[styles.importBannerText, { color: colors.text }]}>
              Detected from a payment notification. Review the details below before saving.
            </Text>
          </View>
        )}
        <Controller
          control={control}
          name="type"
          render={({ field: { value, onChange } }) => <TypeToggle value={value} onChange={onChange} />}
        />

        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange } }) => (
            <InputField
              label="Title"
              placeholder="e.g. Grocery shopping"
              value={value}
              onChangeText={onChange}
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange } }) => (
            <InputField
              label="Amount"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={onChange}
              error={errors.amount?.message}
            />
          )}
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
          <CategoryPicker
            value={category as CategoryName}
            onChange={(c) => c !== 'all' && setValue('category', c)}
            categories={categoryOptions}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateInput, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={{ color: colors.text }}>{new Date(date).toDateString()}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(date)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, selected) => {
                // Android auto-dismisses; iOS inline stays open until "Done" is tapped below.
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setValue('date', selected.toISOString());
              }}
            />
          )}
          {showDatePicker && Platform.OS === 'ios' && (
            <Button label="Done" variant="secondary" onPress={() => setShowDatePicker(false)} />
          )}
        </View>

        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange } }) => (
            <InputField
              label="Notes (optional)"
              placeholder="Add a note..."
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              error={errors.notes?.message}
            />
          )}
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Receipt (optional)</Text>
          {receiptUri ? (
            <View>
              <Image source={{ uri: receiptUri }} style={styles.receiptPreview} />
              <Pressable onPress={() => setValue('receiptUri', undefined)} style={styles.removeReceipt}>
                <Text style={{ color: colors.danger }}>Remove photo</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.receiptButtons}>
              <Button label="Camera" variant="secondary" onPress={() => pickImage(true)} />
              <Button label="Gallery" variant="secondary" onPress={() => pickImage(false)} />
            </View>
          )}
        </View>

        <Button
          label={isEditing ? 'Save Changes' : 'Add Transaction'}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
        />

        {isEditing && (
          <View style={{ marginTop: spacing.md }}>
            <Button label="Delete Transaction" variant="danger" onPress={handleDelete} />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  importBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  importBannerText: {
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  receiptButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  receiptPreview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
  },
  removeReceipt: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
});
