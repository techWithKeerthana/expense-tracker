import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fontSize, spacing } from '../constants/theme';

interface PinKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

export function PinKeypad({ onDigit, onBackspace, disabled }: PinKeypadProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.grid, disabled && { opacity: 0.4 }]}>
      {KEYS.map((key, index) => {
        if (key === '') return <View key={index} style={styles.key} />;
        if (key === 'back') {
          return (
            <Pressable key={index} onPress={onBackspace} disabled={disabled} style={styles.key}>
              <Ionicons name="backspace-outline" size={24} color={colors.text} />
            </Pressable>
          );
        }
        return (
          <Pressable
            key={index}
            onPress={() => onDigit(key)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.key,
              { backgroundColor: pressed ? colors.surfaceAlt : 'transparent' },
            ]}
          >
            <Text style={[styles.digit, { color: colors.text }]}>{key}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  key: {
    width: '33.33%',
    aspectRatio: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
  },
});
