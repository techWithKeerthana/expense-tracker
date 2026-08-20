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

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePin'>;

const PIN_LENGTH = 4;
type Stage = 'current' | 'new' | 'confirm';

export function ChangePinScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { disablePin, changePin } = useAuth();
  const mode = route.params?.mode ?? 'change';

  const [stage, setStage] = useState<Stage>('current');
  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const stageTitle: Record<Stage, string> = {
    current: 'Enter current PIN',
    new: 'Enter new PIN',
    confirm: 'Confirm new PIN',
  };

  const reset = () => {
    setPin('');
    setStage('current');
    setCurrentPin('');
    setNewPin('');
  };

  const handleDigit = async (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    if (next.length !== PIN_LENGTH) return;

    if (stage === 'current') {
      if (mode === 'disable') {
        const success = await disablePin(next);
        if (success) {
          Alert.alert('PIN disabled', 'App lock has been turned off.');
          navigation.goBack();
        } else {
          Alert.alert('Incorrect PIN', 'Please try again.');
          reset();
        }
        return;
      }
      setCurrentPin(next);
      setPin('');
      setStage('new');
      return;
    }

    if (stage === 'new') {
      setNewPin(next);
      setPin('');
      setStage('confirm');
      return;
    }

    if (stage === 'confirm') {
      if (next !== newPin) {
        Alert.alert('PIN mismatch', 'The new PINs do not match. Please try again.');
        setPin('');
        setStage('new');
        setNewPin('');
        return;
      }
      const success = await changePin(currentPin, next);
      if (success) {
        Alert.alert('PIN updated', 'Your PIN has been changed successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Incorrect PIN', 'Your current PIN was incorrect.');
        reset();
      }
    }
  };

  const handleBackspace = () => setPin((prev) => prev.slice(0, -1));

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{stageTitle[stage]}</Text>
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
  dotsWrap: {
    marginTop: spacing.xl,
  },
});
