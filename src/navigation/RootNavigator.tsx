import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { useTheme } from '../context/ThemeContext';
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { PinLockScreen } from '../screens/Auth/PinLockScreen';
import { CreatePinScreen } from '../screens/Auth/CreatePinScreen';
import { ChangePinScreen } from '../screens/Auth/ChangePinScreen';
import { AddEditTransactionScreen } from '../screens/Transactions/AddEditTransactionScreen';
import { TransactionDetailsScreen } from '../screens/Transactions/TransactionDetailsScreen';
import { BudgetScreen } from '../screens/Budget/BudgetScreen';
import { AppearanceScreen } from '../screens/Settings/AppearanceScreen';
import { ExportImportScreen } from '../screens/Settings/ExportImportScreen';
import { SmartImportScreen } from '../screens/Settings/SmartImportScreen';
import { AiAssistantScreen } from '../screens/AiAssistant/AiAssistantScreen';
import { GoalsScreen } from '../screens/Goals/GoalsScreen';
import { AddEditGoalScreen } from '../screens/Goals/AddEditGoalScreen';
import { AddGoalContributionScreen } from '../screens/Goals/AddGoalContributionScreen';
import { HealthScoreScreen } from '../screens/HealthScore/HealthScoreScreen';
import { WhatIfSimulatorScreen } from '../screens/WhatIfSimulator/WhatIfSimulatorScreen';
import { InsightsHubScreen } from '../screens/Insights/InsightsHubScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PinLock" component={PinLockScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreatePin" component={CreatePinScreen} options={{ title: 'Set PIN' }} />
      <Stack.Screen name="ChangePin" component={ChangePinScreen} options={{ title: 'PIN' }} />
      <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddEditTransaction"
        component={AddEditTransactionScreen}
        options={{ title: 'Add Transaction', presentation: 'modal' }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ title: 'Transaction Details' }}
      />
      <Stack.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget' }} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} options={{ title: 'Appearance' }} />
      <Stack.Screen name="ExportImport" component={ExportImportScreen} options={{ title: 'Export & Backup' }} />
      <Stack.Screen name="SmartImport" component={SmartImportScreen} options={{ title: 'Smart Import' }} />
      <Stack.Screen name="AiAssistant" component={AiAssistantScreen} options={{ title: 'AI Financial Assistant' }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'Financial Goals' }} />
      <Stack.Screen
        name="AddEditGoal"
        component={AddEditGoalScreen}
        options={{ title: 'Goal', presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddGoalContribution"
        component={AddGoalContributionScreen}
        options={{ title: 'Add Funds', presentation: 'modal' }}
      />
      <Stack.Screen name="HealthScore" component={HealthScoreScreen} options={{ title: 'Financial Health Score' }} />
      <Stack.Screen name="WhatIfSimulator" component={WhatIfSimulatorScreen} options={{ title: 'What-If Simulator' }} />
      <Stack.Screen name="InsightsHub" component={InsightsHubScreen} options={{ title: 'Insights & Tools' }} />
    </Stack.Navigator>
  );
}
