import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types';

const TOKEN_KEY = 'expense_tracker_auth_token';
const USER_KEY = '@expense_tracker/auth_user';

// expo-secure-store has no web implementation; fall back to AsyncStorage there.
const secureSet = (key: string, value: string) =>
  Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);
const secureGet = (key: string) =>
  Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
const secureDelete = (key: string) =>
  Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);

async function saveSession(token: string, user: AuthUser): Promise<void> {
  await secureSet(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function getToken(): Promise<string | null> {
  return secureGet(TOKEN_KEY);
}

async function getUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function clearSession(): Promise<void> {
  await secureDelete(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export const accountStorage = { saveSession, getToken, getUser, clearSession };
