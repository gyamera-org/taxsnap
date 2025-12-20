import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { en } from './locales/en';
import { es } from './locales/es';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { fr } from './locales/fr';

const LANGUAGE_STORAGE_KEY = '@app_language';

export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
  de: { name: 'German', nativeName: 'Deutsch' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  fr: { name: 'French', nativeName: 'Français' },
} as const;

export type LanguageCode = keyof typeof supportedLanguages;

const resources = {
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  pt: { translation: pt },
  fr: { translation: fr },
};

const getDeviceLanguage = (): LanguageCode => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
  return deviceLocale in supportedLanguages ? (deviceLocale as LanguageCode) : 'en';
};

export const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  const initialLanguage = savedLanguage || getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

export const changeLanguage = async (languageCode: LanguageCode) => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  await i18n.changeLanguage(languageCode);
};

export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language as LanguageCode) || 'en';
};

export default i18n;
