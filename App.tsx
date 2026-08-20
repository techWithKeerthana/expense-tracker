import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { TransactionProvider } from './src/context/TransactionContext';
import { BudgetProvider } from './src/context/BudgetContext';
import { GoalProvider } from './src/context/GoalContext';
import { AuthProvider } from './src/context/AuthContext';
import { AccountProvider } from './src/context/AccountContext';
import { SyncProvider } from './src/context/SyncContext';
import { SmartImportProvider } from './src/context/SmartImportContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';

function AppShell() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AccountProvider>
              <BudgetProvider>
                <TransactionProvider>
                  <GoalProvider>
                    <SyncProvider>
                      <SmartImportProvider>
                        <AppShell />
                      </SmartImportProvider>
                    </SyncProvider>
                  </GoalProvider>
                </TransactionProvider>
              </BudgetProvider>
            </AccountProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
