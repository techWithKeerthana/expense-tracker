import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAccount } from '../../context/AccountContext';
import { fontSize, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { isLoading: isPinLoading, pinEnabled } = useAuth();
  const { isLoading: isAccountLoading, isAuthenticated } = useAccount();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPinLoading || isAccountLoading) return;
      if (!isAuthenticated) {
        navigation.replace('Login');
      } else if (pinEnabled) {
        navigation.replace('PinLock');
      } else {
        navigation.replace('Main', { screen: 'Dashboard' });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation, isPinLoading, isAccountLoading, pinEnabled, isAuthenticated]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Ionicons name="wallet-outline" size={72} color={colors.primaryText} />
      <Text style={[styles.title, { color: colors.primaryText }]}>Expense Tracker</Text>
      <Text style={[styles.subtitle, { color: colors.primaryText }]}>Track. Save. Grow.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    opacity: 0.85,
  },
});
