import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resources, Language, SUPPORTED_LANGUAGES } from './locales';

const LANGUAGE_STORAGE_KEY = '@pcos_language';

// Get the device's preferred language
const getDeviceLanguage = (): Language => {
  try {
    const deviceLocale = getLocales()[0]?.languageCode || 'en';
    const supportedCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
    return supportedCodes.includes(deviceLocale as Language) ? (deviceLocale as Language) : 'en';
  } catch {
    return 'en';
  }
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Load saved language preference
export const loadSavedLanguage = async (): Promise<void> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && SUPPORTED_LANGUAGES.some((l) => l.code === savedLanguage)) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Failed to load saved language:', error);
  }
};

// Change and save language
export const changeLanguage = async (language: Language): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): Language => {
  return i18n.language as Language;
};

export { SUPPORTED_LANGUAGES, Language };
export default i18n;
