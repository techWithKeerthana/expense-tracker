import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../context/TransactionContext';
import { useBudget } from '../../context/BudgetContext';
import { answerFinancialQuery, SUGGESTED_QUESTIONS } from '../../utils/aiAssistant';
import { fontSize, radius, spacing } from '../../constants/theme';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

let nextMessageId = 1;

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  text:
    "Hi! I'm your financial assistant. Ask me about your spending, budget, or income — " +
    'try one of the suggestions below to get started.',
};

export function AiAssistantScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  const { budget } = useBudget();
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { id: `m${nextMessageId++}`, role: 'user', text: trimmed };
    const { message } = answerFinancialQuery(trimmed, transactions, budget);
    const assistantMessage: ChatMessage = { id: `m${nextMessageId++}`, role: 'assistant', text: message };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user'
                  ? { alignSelf: 'flex-end', backgroundColor: colors.primary }
                  : { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <Text style={{ color: item.role === 'user' ? colors.primaryText : colors.text, fontSize: fontSize.sm }}>
                {item.text}
              </Text>
            </View>
          )}
        />

        <FlatList
          horizontal
          data={SUGGESTED_QUESTIONS}
          keyExtractor={(q) => q}
          showsHorizontalScrollIndicator={false}
          style={styles.suggestions}
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => ask(item)}
              style={[styles.chip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{item}</Text>
            </Pressable>
          )}
        />

        <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your finances..."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceAlt }]}
            onSubmitEditing={() => ask(input)}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => ask(input)}
            disabled={!input.trim()}
            style={[styles.sendButton, { backgroundColor: colors.primary, opacity: input.trim() ? 1 : 0.5 }]}
          >
            <Ionicons name="send" size={18} color={colors.primaryText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  messageList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestions: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
