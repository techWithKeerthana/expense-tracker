import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { PasswordStrengthChecklist } from '../../components/PasswordStrengthChecklist';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { registerSchema, RegisterFormValues } from '../../utils/validation';
import { fontSize, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { register } = useAccount();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const password = watch('password');

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setServerError(null);
    const result = await register(values.name, values.email, values.password);
    setSubmitting(false);
    if (!result.success) {
      setServerError(result.message ?? 'Registration failed. Please try again.');
    } else {
      navigation.replace('Main', { screen: 'Dashboard' });
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Ionicons name="person-add-outline" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Your data stays on-device and syncs to the cloud once you're signed in.
        </Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <InputField label="Name" placeholder="Your name" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <InputField
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <InputField
              label="Password"
              placeholder="Create a strong password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />
        <PasswordStrengthChecklist password={password} />

        {serverError ? <Text style={[styles.serverError, { color: colors.danger }]}>{serverError}</Text> : null}

        <Button label="Create Account" onPress={handleSubmit(onSubmit)} loading={submitting} />

        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Log In</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  serverError: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
});
