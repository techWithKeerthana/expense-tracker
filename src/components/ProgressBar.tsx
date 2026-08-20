import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { gradients } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0 - 1
  color?: string;
  height?: number;
  gradient?: boolean;
}

export function ProgressBar({ progress, color, height = 8, gradient = false }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const barColor = color ?? (clamped >= 1 ? colors.danger : clamped >= 0.8 ? colors.warning : colors.primary);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, { toValue: clamped, duration: 300, useNativeDriver: false }).start();
  }, [clamped, widthAnim]);

  const animatedWidth = widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceAlt, height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { width: animatedWidth, borderRadius: height / 2 }]}>
        {gradient ? (
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: barColor }]} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
});
