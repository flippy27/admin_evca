/**
 * App store — global app settings (Zustand)
 * Manages: language, color scheme
 * Persists to AsyncStorage
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/lib/i18n';
import type { LanguageCode } from '@/lib/i18n/languages';

const STORAGE_KEY = 'app_settings';

interface AppState {
  language: LanguageCode;
  colorScheme: 'light' | 'dark' | 'system';

  setLanguage: (lang: LanguageCode) => Promise<void>;
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => Promise<void>;
  restoreSettings: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'es',
  colorScheme: 'system',

  setLanguage: async (lang: LanguageCode) => {
    set({ language: lang });
    await i18n.changeLanguage(lang);
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
        if (settings.language) {
          set({ language: settings.language });
          await i18n.changeLanguage(settings.language);
        }
        if (settings.colorScheme) set({ colorScheme: settings.colorScheme });
      }
    } catch (error) {
      console.error('Failed to restore settings:', error);
    }
  },
}));
