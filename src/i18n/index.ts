import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

export const supportedLanguages = ['en', 'hi', 'mr'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];
export const isSupportedLanguage = (value: unknown): value is SupportedLanguage =>
  typeof value === 'string' && supportedLanguages.includes(value as SupportedLanguage);
export const normalizeLanguage = (value: unknown): SupportedLanguage => {
  const baseLanguage = typeof value === 'string' ? value.split('-')[0] : value;
  return isSupportedLanguage(baseLanguage) ? baseLanguage : 'en';
};
export const languageLocale: Record<SupportedLanguage, string> = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, mr: { translation: mr } },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: [...supportedLanguages],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
