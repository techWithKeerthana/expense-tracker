import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { exportImportService } from '../../utils/exportImport';
import { fontSize, spacing } from '../../constants/theme';

export function ExportImportScreen() {
  const { colors } = useTheme();
  const { transactions, replaceAll, refresh } = useTransactions();
  const [busy, setBusy] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    if (transactions.length === 0) {
      Alert.alert('Nothing to export', 'Add some transactions first.');
      return;
    }
    setBusy(true);
    try {
      await exportImportService.exportFile(transactions, format);
    } catch {
      Alert.alert('Export failed', 'Something went wrong while exporting your data.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/csv', 'text/comma-separated-values', '*/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setBusy(true);
    try {
      const imported = await exportImportService.importFile(result.assets[0].uri);
      if (imported.length === 0) {
        Alert.alert('No data found', 'The selected file did not contain valid transactions.');
        return;
      }
      Alert.alert(
        'Import Transactions',
        `Found ${imported.length} transactions. This will replace all current data. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: async () => {
              await replaceAll(imported);
              await refresh();
              Alert.alert('Import complete', 'Your transactions have been restored.');
            },
          },
        ]
      );
    } catch {
      Alert.alert('Import failed', 'The selected file could not be read as a valid backup.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Export & Backup</Text>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Transactions</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Save all your transactions as a file you can share or store as a backup.
          </Text>
          <Button label="Export as CSV" onPress={() => handleExport('csv')} loading={busy} />
          <View style={{ height: spacing.md }} />
          <Button label="Export as JSON" variant="secondary" onPress={() => handleExport('json')} loading={busy} />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Restore from Backup</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Import a previously exported CSV or JSON file. This will replace your current data.
          </Text>
          <Button label="Import Backup File" variant="secondary" onPress={handleImport} loading={busy} />
        </Card>
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
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});
