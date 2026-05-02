/**
 * Language registry — add new entries here to extend app language support.
 *
 * To add a new language:
 *  1. Add an entry to SUPPORTED_LANGUAGES with the BCP-47 code and display label.
 *  2. Create lib/i18n/<code>.json with the translation keys.
 *  3. Import it below and add it to i18nResources.
 *
 * The Sidebar language picker reads from SUPPORTED_LANGUAGES automatically.
 */

import en from './en.json';
import es from './es.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'Español', resource: es },
  { code: 'en', label: 'English', resource: en },
  // { code: 'pt', label: 'Português', resource: pt },  ← example: import pt from './pt.json'
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

/** Pre-built resources object for i18next init */
export const i18nResources: Record<string, { translation: object }> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [lang.code, { translation: lang.resource }])
);
