/**
 * App store — global app settings (Zustand)
 * Manages: language, color scheme
 * Persists to AsyncStorage
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'app_settings';

interface AppState {
  language: 'es' | 'en';
  colorScheme: 'light' | 'dark' | 'system';

  setLanguage: (lang: 'es' | 'en') => Promise<void>;
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => Promise<void>;
  restoreSettings: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'es',
  colorScheme: 'system',

  setLanguage: async (lang: 'es' | 'en') => {
    set({ language: lang });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, language: lang }));
    } catch (error) {
      console.error('Failed to persist language:', error);
    }
  },

  setColorScheme: async (scheme: 'light' | 'dark' | 'system') => {
    console.log('[AppStore] setColorScheme called with:', scheme);
    set({ colorScheme: scheme });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, colorScheme: scheme }));
    } catch (error) {
      console.error('Failed to persist colorScheme:', error);
    }
  },

  restoreSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.language) set({ language: settings.language });
        if (settings.colorScheme) set({ colorScheme: settings.colorScheme });
      }
    } catch (error) {
      console.error('Failed to restore settings:', error);
    }
  },
}));
