import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAccount } from '../../context/AccountContext';
import { fontSize, spacing } from '../../constants/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SettingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { pinEnabled } = useAuth();
  const { user, logout } = useAccount();

  const togglePin = (value: boolean) => {
    if (value) {
      navigation.navigate('CreatePin');
    } else {
      navigation.navigate('ChangePin', { mode: 'disable' });
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Your local data stays on this device. You can log back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <Card style={styles.section}>
        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={20} color={colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.text }]}>{user?.name ?? 'Account'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{user?.email}</Text>
          </View>
        </View>
        <MenuRow icon="log-out-outline" label="Log Out" onPress={handleLogout} isLast />
      </Card>

      <Card style={styles.section}>
        <MenuRow
          icon="color-palette-outline"
          label="Appearance"
          onPress={() => navigation.navigate('Appearance')}
        />
        <MenuRow icon="wallet-outline" label="Budget Management" onPress={() => navigation.navigate('Budget')} />
        <MenuRow
          icon="cloud-upload-outline"
          label="Export & Backup"
          onPress={() => navigation.navigate('ExportImport')}
        />
        <MenuRow
          icon="notifications-outline"
          label="Smart Transaction Import"
          onPress={() => navigation.navigate('SmartImport')}
          isLast
        />
      </Card>

      <Card style={styles.section}>
        <View style={styles.row}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.label, { color: colors.text }]}>App Lock (PIN)</Text>
          <Switch value={pinEnabled} onValueChange={togglePin} />
        </View>
        {pinEnabled && (
          <MenuRow
            icon="key-outline"
            label="Change PIN"
            onPress={() => navigation.navigate('ChangePin', { mode: 'change' })}
            isLast
          />
        )}
      </Card>
    </ScreenContainer>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
    >
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
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
