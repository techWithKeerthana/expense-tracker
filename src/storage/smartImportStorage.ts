import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

async function isEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SMART_IMPORT_ENABLED);
  return raw === 'true';
}

async function setEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SMART_IMPORT_ENABLED, enabled ? 'true' : 'false');
}

export const smartImportStorage = { isEnabled, setEnabled };
