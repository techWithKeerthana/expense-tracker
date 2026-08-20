import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, fontSize, gradients } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, icon }: ButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.surfaceAlt,
    danger: colors.danger,
    ghost: 'transparent',
  }[variant];

  const textColor =
    variant === 'secondary' ? colors.text : variant === 'ghost' ? colors.primary : colors.primaryText;

  const content = loading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <>
      {icon}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => !disabled && !loading && animateTo(0.96)}
      onPressOut={() => animateTo(1)}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.base,
          { backgroundColor, opacity: disabled ? 0.5 : 1 },
          variant === 'ghost' && { borderWidth: 0 },
          { transform: [{ scale }] },
        ]}
      >
        {variant === 'primary' && !disabled ? (
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
        {content}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
