import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useGoals } from '../../context/GoalContext';
import { goalSchema, GoalFormValues } from '../../utils/validation';
import { GOAL_ICONS, IoniconsName } from '../../constants/goalIcons';
import { fontSize, radius, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditGoal'>;

export function AddEditGoalScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const goalId = route.params?.goalId;
  const existing = goalId ? goals.find((g) => g.id === goalId) : undefined;
  const isEditing = Boolean(existing);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: existing?.name ?? '',
      icon: existing?.icon ?? GOAL_ICONS[0],
      targetAmount: existing ? String(existing.targetAmount) : '',
      targetDate: existing?.targetDate ?? new Date().toISOString(),
    },
  });

  const icon = watch('icon');
  const targetDate = watch('targetDate');

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Goal' : 'New Goal' });
  }, [navigation, isEditing]);

  const onSubmit = async (values: GoalFormValues) => {
    setSubmitting(true);
    try {
      const input = {
        name: values.name.trim(),
        icon: values.icon,
        targetAmount: Number(values.targetAmount),
        targetDate: values.targetDate,
      };
      if (isEditing && goalId) {
        await updateGoal(goalId, input);
      } else {
        await addGoal(input);
      }
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!goalId) return;
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGoal(goalId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <InputField
              label="Goal Name"
              placeholder="e.g. Emergency Fund"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="targetAmount"
          render={({ field: { value, onChange } }) => (
            <InputField
              label="Target Amount"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={onChange}
              error={errors.targetAmount?.message}
            />
          )}
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Icon</Text>
          <View style={styles.iconRow}>
            {GOAL_ICONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => setValue('icon', option)}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: option === icon ? colors.primary : colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={option as IoniconsName}
                  size={20}
                  color={option === icon ? colors.primaryText : colors.textSecondary}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Target Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateInput, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={{ color: colors.text }}>{new Date(targetDate).toDateString()}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(targetDate)}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setValue('targetDate', selected.toISOString());
              }}
            />
          )}
          {showDatePicker && Platform.OS === 'ios' && (
            <Button label="Done" variant="secondary" onPress={() => setShowDatePicker(false)} />
          )}
        </View>

        <Button
          label={isEditing ? 'Save Changes' : 'Create Goal'}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
        />

        {isEditing && (
          <View style={{ marginTop: spacing.md }}>
            <Button label="Delete Goal" variant="danger" onPress={handleDelete} />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
