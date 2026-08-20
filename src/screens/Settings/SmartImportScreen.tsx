import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useSmartImport } from '../../context/SmartImportContext';
import { CATEGORY_ICONS } from '../../constants/categories';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { fontSize, radius, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SmartImport'>;

const APP_LABELS: Record<string, string> = {
  googlepay: 'Google Pay',
  phonepe: 'PhonePe',
  paytm: 'Paytm',
};

export function SmartImportScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const {
    isSupported,
    enabled,
    permissionStatus,
    pendingImports,
    setEnabled,
    openNotificationAccessSettings,
    refreshPermissionStatus,
    refreshPendingImports,
    dismissImport,
  } = useSmartImport();

  useFocusEffect(
    useCallback(() => {
      refreshPermissionStatus();
      refreshPendingImports();
    }, [refreshPermissionStatus, refreshPendingImports])
  );

  const handleReview = (id: string) => {
    const item = pendingImports.find((p) => p.id === id);
    if (!item) return;
    navigation.navigate('AddEditTransaction', {
      prefill: {
        title: item.title,
        amount: String(item.amount),
        type: item.type,
        category: item.category,
        date: item.date,
        pendingImportId: item.id,
      },
    });
  };

  if (!isSupported) {
    return (
      <ScreenContainer>
        <Text style={[styles.title, { color: colors.text }]}>Smart Transaction Import</Text>
        <EmptyState
          icon="logo-android"
          title="Android only"
          subtitle="Reading payment notifications relies on Android's notification listener APIs, which iOS does not allow third-party apps to use. This feature isn't available on iOS."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Smart Transaction Import</Text>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How it works</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            When enabled, the app reads incoming notifications from Google Pay, PhonePe, and Paytm on this
            device to detect payments and suggest transactions — nothing is saved automatically. You'll
            always see a Review &amp; Save screen first. This requires granting Android's "Notification
            access" permission, which lets the app read the *content* of all notifications while it's
            enabled — only messages from the three UPI apps above are ever processed or stored, everything
            else is ignored and discarded immediately.
          </Text>
        </Card>

        <Card style={styles.section}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.label, { color: colors.text }]}>Enable Smart Import</Text>
            <Switch value={enabled} onValueChange={setEnabled} />
          </View>
          <View style={[styles.row, { paddingTop: 0 }]}>
            <Ionicons
              name={permissionStatus === 'authorized' ? 'checkmark-circle' : 'alert-circle-outline'}
              size={20}
              color={permissionStatus === 'authorized' ? colors.success : colors.warning}
            />
            <Text style={{ color: colors.textSecondary, flex: 1, fontSize: fontSize.sm }}>
              Notification access:{' '}
              <Text style={{ fontWeight: '700' }}>
                {permissionStatus === 'authorized' ? 'Granted' : permissionStatus === 'denied' ? 'Not granted' : 'Unknown'}
              </Text>
            </Text>
          </View>
          <Button label="Open Notification Access Settings" variant="secondary" onPress={openNotificationAccessSettings} />
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.md }]}>
          Detected Transactions ({pendingImports.length})
        </Text>
        {pendingImports.length === 0 ? (
          <EmptyState
            icon="sparkles-outline"
            title="No transactions detected yet"
            subtitle="Once enabled and permitted, detected UPI payments will show up here for review."
          />
        ) : (
          pendingImports.map((item) => (
            <Card key={item.id} style={styles.importRow}>
              <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}22` }]}>
                <Ionicons name={CATEGORY_ICONS[item.category]} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.importTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                  {APP_LABELS[item.sourceApp] ?? item.sourceApp} • {formatDate(item.date)}
                </Text>
              </View>
              <Text style={{ color: item.type === 'income' ? colors.income : colors.expense, fontWeight: '700' }}>
                {item.type === 'income' ? '+' : '-'}
                {formatCurrency(item.amount)}
              </Text>
              <View style={styles.importActions}>
                <Pressable onPress={() => handleReview(item.id)} style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: colors.primaryText, fontSize: fontSize.xs, fontWeight: '700' }}>Review</Text>
                </Pressable>
                <Pressable onPress={() => dismissImport(item.id)} style={styles.actionButton}>
                  <Text style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: '700' }}>Dismiss</Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  importRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  importActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    width: '100%',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
});
