import { Platform } from 'react-native';
import RNAndroidNotificationListener, {
  RNAndroidNotificationListenerHeadlessJsName,
} from 'react-native-android-notification-listener';
import { pendingImportStorage } from '../storage/pendingImportStorage';
import { smartImportStorage } from '../storage/smartImportStorage';
import { guessCategoryFromText } from '../utils/autoCategorize';
import { parseUpiNotification, UPI_APP_PACKAGES } from '../utils/upiNotificationParser';
import { generateId } from '../utils/id';

export type PermissionStatus = 'unknown' | 'authorized' | 'denied';

interface RawNotification {
  app?: string;
  text?: string;
  bigText?: string;
  title?: string;
  time?: string;
}

async function getPermissionStatus(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') return 'denied';
  try {
    return (await RNAndroidNotificationListener?.getPermissionStatus?.()) ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function openNotificationAccessSettings(): void {
  if (Platform.OS !== 'android') return;
  try {
    RNAndroidNotificationListener?.requestPermission?.();
  } catch {
    // Native module unavailable (e.g. running in Expo Go instead of the dev client build).
  }
}

/**
 * Parses one incoming Android notification and, if it's a recognized UPI payment
 * notification and the user has opted in, queues it as a pending import for review.
 * Never writes directly to the transaction list — see the Review & Save screen.
 */
async function handleIncomingNotification(raw: RawNotification): Promise<void> {
  const enabled = await smartImportStorage.isEnabled();
  if (!enabled || !raw.app) return;

  const upiApp = UPI_APP_PACKAGES[raw.app];
  if (!upiApp) return;

  const text = raw.bigText || raw.text || '';
  if (!text) return;

  const parsed = parseUpiNotification(upiApp, text);
  if (!parsed) return;

  const detectedAt = raw.time ? new Date(Number(raw.time)).toISOString() : new Date().toISOString();
  const type = parsed.direction === 'credit' ? 'income' : 'expense';

  await pendingImportStorage.add({
    id: generateId(),
    title: parsed.counterparty || 'UPI Transaction',
    amount: parsed.amount,
    type,
    category: type === 'income' ? 'Other' : guessCategoryFromText(parsed.counterparty),
    date: detectedAt,
    sourceApp: upiApp,
    rawText: text,
    detectedAt,
  });
}

export const notificationImportService = {
  getPermissionStatus,
  openNotificationAccessSettings,
  handleIncomingNotification,
  headlessTaskName: RNAndroidNotificationListenerHeadlessJsName,
};
