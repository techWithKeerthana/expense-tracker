import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSync } from '../context/SyncContext';
import { fontSize, radius, spacing } from '../constants/theme';

const CONFIG = {
  synced: { icon: 'cloud-done-outline' as const, label: 'Synced' },
  syncing: { icon: 'sync-outline' as const, label: 'Syncing…' },
  offline: { icon: 'cloud-offline-outline' as const, label: 'Offline' },
  error: { icon: 'warning-outline' as const, label: 'Sync failed' },
};

export function SyncStatusBadge() {
  const { colors } = useTheme();
  const { status } = useSync();
  const { icon, label } = CONFIG[status];

  const color = status === 'error' ? colors.danger : status === 'synced' ? colors.success : colors.textMuted;

  return (
    <View style={[styles.badge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
