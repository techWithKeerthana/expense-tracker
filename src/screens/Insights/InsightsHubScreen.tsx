import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, gradients, radius, spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'InsightsHub'>;

interface InsightItem {
  key: keyof RootStackParamList;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const ITEMS: InsightItem[] = [
  {
    key: 'AiAssistant',
    icon: 'chatbubble-ellipses-outline',
    title: 'AI Financial Assistant',
    description: 'Ask questions about your spending, budget, and trends in plain language.',
  },
  {
    key: 'Goals',
    icon: 'flag-outline',
    title: 'Financial Goals',
    description: 'Set savings targets and track progress toward each one.',
  },
  {
    key: 'HealthScore',
    icon: 'pulse-outline',
    title: 'Financial Health Score',
    description: 'A 0-100 score built from your savings rate, budget, and consistency.',
  },
  {
    key: 'WhatIfSimulator',
    icon: 'git-branch-outline',
    title: 'What-If Simulator',
    description: 'Preview how a spending or income change would affect your month.',
  },
];

export function InsightsHubScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Insights & Tools</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Smart, on-device tools that go beyond basic tracking.
      </Text>
      {ITEMS.map((item) => (
        <InsightCard key={item.key} item={item} onPress={() => navigation.navigate(item.key as never)} />
      ))}
    </ScreenContainer>
  );
}

function InsightCard({ item, onPress }: { item: InsightItem; onPress: () => void }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={() => animateTo(0.98)} onPressOut={() => animateTo(1)}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Card style={styles.card}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBadge}
          >
            <Ionicons name={item.icon} size={22} color="#04120F" />
          </LinearGradient>
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.cardDescription, { color: colors.textMuted }]}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Card>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
