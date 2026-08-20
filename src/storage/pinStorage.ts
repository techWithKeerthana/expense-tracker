import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS, SECURE_STORE_KEYS } from './storageKeys';

// expo-secure-store has no web implementation; fall back to AsyncStorage there
// (native builds always use the Keychain/Keystore-backed SecureStore).
const secureSet = (key: string, value: string) =>
  Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);
const secureGet = (key: string) =>
  Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
const secureDelete = (key: string) =>
  Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);

async function isPinEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.PIN_ENABLED);
  return raw === 'true';
}

async function setPinEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PIN_ENABLED, enabled ? 'true' : 'false');
}

async function savePin(pin: string): Promise<void> {
  await secureSet(SECURE_STORE_KEYS.PIN_CODE, pin);
  await setPinEnabled(true);
}

async function verifyPin(pin: string): Promise<boolean> {
  const stored = await secureGet(SECURE_STORE_KEYS.PIN_CODE);
  return stored !== null && stored === pin;
}

async function hasPin(): Promise<boolean> {
  const stored = await secureGet(SECURE_STORE_KEYS.PIN_CODE);
  return stored !== null;
}

async function clearPin(): Promise<void> {
  await secureDelete(SECURE_STORE_KEYS.PIN_CODE);
  await setPinEnabled(false);
}

export const pinStorage = { isPinEnabled, setPinEnabled, savePin, verifyPin, hasPin, clearPin };

