import { createContext, useContext, useState, useEffect, useCallback, type PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { initI18n, changeLanguage, getCurrentLanguage, type LanguageCode, supportedLanguages } from '@/lib/i18n';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (code: LanguageCode) => Promise<void>;
  supportedLanguages: typeof supportedLanguages;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  useEffect(() => {
    const init = async () => {
      await initI18n();
      setCurrentLanguage(getCurrentLanguage());
      setIsReady(true);
    };
    init();
  }, []);

  const setLanguage = useCallback(async (code: LanguageCode) => {
    await changeLanguage(code);
    setCurrentLanguage(code);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        supportedLanguages,
        isReady,
      }}
    >
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
