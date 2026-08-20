import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../types';
import { fontSize, radius, spacing } from '../../constants/theme';

const OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
  { mode: 'system', label: 'System Default', icon: 'phone-portrait-outline' },
];

export function AppearanceScreen() {
  const { colors, mode, setMode } = useTheme();

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
      <Card>
        {OPTIONS.map((option, index) => {
          const active = mode === option.mode;
          return (
            <Pressable
              key={option.mode}
              onPress={() => setMode(option.mode)}
              style={[
                styles.row,
                index !== OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Ionicons name={option.icon} size={20} color={colors.textSecondary} />
              <Text style={[styles.label, { color: colors.text }]}>{option.label}</Text>
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>
          );
        })}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
});
