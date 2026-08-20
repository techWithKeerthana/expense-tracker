import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PASSWORD_REQUIREMENTS } from '../utils/passwordStrength';
import { fontSize, spacing } from '../constants/theme';

interface PasswordStrengthChecklistProps {
  password: string;
}

export function PasswordStrengthChecklist({ password }: PasswordStrengthChecklistProps) {
  const { colors } = useTheme();

  if (!password) return null;

  return (
    <View style={styles.container}>
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = req.test(password);
        return (
          <View key={req.key} style={styles.row}>
            <Ionicons
              name={met ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={met ? colors.success : colors.textMuted}
            />
            <Text style={[styles.label, { color: met ? colors.success : colors.textMuted }]}>{req.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
  },
});
