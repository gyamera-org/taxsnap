import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  loadSavedLanguage,
  changeLanguage as changeI18nLanguage,
  getCurrentLanguage,
  SUPPORTED_LANGUAGES,
  Language,
} from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initLanguage = async () => {
      await loadSavedLanguage();
      setLanguage(getCurrentLanguage());
      setIsLoading(false);
    };
    initLanguage();
  }, []);

  // Update state when i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng as Language);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (lang: Language) => {
    await changeI18nLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
