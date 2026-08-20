import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../types';
import { STORAGE_KEYS } from './storageKeys';

async function getThemeMode(): Promise<ThemeMode> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
}

export const themeStorage = { getThemeMode, saveThemeMode };
