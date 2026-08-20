import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PinDots } from '../../components/PinDots';
import { PinKeypad } from '../../components/PinKeypad';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { fontSize, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PinLock'>;

const PIN_LENGTH = 4;

export function PinLockScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { unlock, lockedUntil, attemptsRemaining } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!lockedUntil) {
      setSecondsLeft(0);
      return;
    }
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = secondsLeft > 0;

  const handleDigit = async (digit: string) => {
    if (isLocked || pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === PIN_LENGTH) {
      const valid = await unlock(next);
      if (valid) {
        navigation.replace('Main', { screen: 'Dashboard' });
      } else {
        setError(true);
        setPin('');
      }
    }
  };

  const handleBackspace = () => setPin((prev) => prev.slice(0, -1));

  const subtitle = isLocked
    ? `Too many incorrect attempts. Try again in ${secondsLeft}s.`
    : error
      ? `Incorrect PIN. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`
      : 'Enter your PIN to unlock the app.';

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Ionicons name="lock-closed-outline" size={40} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Enter PIN</Text>
        <Text style={[styles.subtitle, { color: error || isLocked ? colors.danger : colors.textMuted }]}>
          {subtitle}
        </Text>
        <View style={styles.dotsWrap}>
          <PinDots length={PIN_LENGTH} filled={pin.length} />
        </View>
      </View>
      <PinKeypad onDigit={handleDigit} onBackspace={handleBackspace} disabled={isLocked} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  dotsWrap: {
    marginTop: spacing.xl,
  },
});
