import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';

import App from './App';
import { notificationImportService } from './src/services/notificationImportService';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Headless JS task: the native NotificationListenerService invokes this even when
// the app is backgrounded/killed, so it must stay a small, self-contained handler.
if (Platform.OS === 'android') {
  AppRegistry.registerHeadlessTask(notificationImportService.headlessTaskName, () => async ({ notification }: { notification?: string }) => {
    if (!notification) return;
    try {
      await notificationImportService.handleIncomingNotification(JSON.parse(notification));
    } catch {
      // Malformed/unparseable notification payload — safe to ignore.
    }
  });
}
