import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PinDots } from '../../components/PinDots';
import { PinKeypad } from '../../components/PinKeypad';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { fontSize, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePin'>;

const PIN_LENGTH = 4;

export function CreatePinScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { createPin } = useAuth();
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');

  const handleDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      if (stage === 'enter') {
        setFirstPin(next);
        setPin('');
        setStage('confirm');
      } else {
        if (next === firstPin) {
          createPin(next).then(() => navigation.goBack());
        } else {
          Alert.alert('PIN mismatch', 'The PINs you entered do not match. Please try again.');
          setPin('');
          setFirstPin('');
          setStage('enter');
        }
      }
    }
  };

  const handleBackspace = () => setPin((prev) => prev.slice(0, -1));

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {stage === 'enter' ? 'Create a PIN' : 'Confirm your PIN'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {stage === 'enter' ? 'Enter a 4-digit PIN to lock the app.' : 'Re-enter the PIN to confirm.'}
        </Text>
        <View style={styles.dotsWrap}>
          <PinDots length={PIN_LENGTH} filled={pin.length} />
        </View>
      </View>
      <PinKeypad onDigit={handleDigit} onBackspace={handleBackspace} />
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
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  dotsWrap: {
    marginTop: spacing.xl,
  },
});
