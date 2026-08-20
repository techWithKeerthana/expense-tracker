import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useGoals } from '../../context/GoalContext';
import { contributionSchema, ContributionFormValues } from '../../utils/validation';
import { formatCurrency } from '../../utils/formatters';
import { fontSize, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddGoalContribution'>;

export function AddGoalContributionScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { goals, addContribution } = useGoals();
  const { goalId } = route.params;
  const goal = goals.find((g) => g.id === goalId);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { amount: '' },
  });

  const onSubmit = async (values: ContributionFormValues) => {
    setSubmitting(true);
    try {
      await addContribution(goalId, Number(values.amount));
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      {goal && (
        <View style={styles.summary}>
          <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
            {formatCurrency(goal.savedAmount)} saved of {formatCurrency(goal.targetAmount)} target
          </Text>
        </View>
      )}

      <Controller
        control={control}
        name="amount"
        render={({ field: { value, onChange } }) => (
          <InputField
            label="Amount to add"
            placeholder="0.00"
            keyboardType="decimal-pad"
            autoFocus
            value={value}
            onChangeText={onChange}
            error={errors.amount?.message}
          />
        )}
      />

      <Button label="Add Funds" onPress={handleSubmit(onSubmit)} loading={submitting} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginBottom: spacing.xl,
  },
  goalName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
});
