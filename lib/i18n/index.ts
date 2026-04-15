/**
 * i18n setup using i18next + react-i18next
 * Loads translation files and initializes i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import es from './es.json';
import en from './en.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
};

// Detect device locale
const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const defaultLanguage = deviceLanguage === 'en' ? 'en' : 'es';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    compatibilityJSON: 'v3', // For RN compatibility
  });

export default i18n;
