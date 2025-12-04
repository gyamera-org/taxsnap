import en from './en';
import es from './es';
import fr from './fr';

export const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

export type Language = keyof typeof resources;

export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];
