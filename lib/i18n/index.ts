/**
 * i18n setup using i18next + react-i18next
 * Language registry is in ./languages.ts — add new languages there.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { i18nResources, LanguageCode, SUPPORTED_LANGUAGES } from './languages';

const deviceLanguage = Localization.getLocales()[0]?.languageCode as LanguageCode | undefined;
const supportedCodes = SUPPORTED_LANGUAGES.map((l) => l.code) as readonly string[];
const defaultLanguage: LanguageCode = supportedCodes.includes(deviceLanguage ?? '') ? (deviceLanguage as LanguageCode) : 'es';

i18n
  .use(initReactI18next)
  .init({
    resources: i18nResources,
    lng: defaultLanguage,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

export default i18n;
