import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';

// Supported languages
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// Default language
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY = 'shiftswap_language';

// Initialize i18next
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            pt: { translation: ptTranslations },
        },
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),

        // Detection options
        detection: {
            // Order of language detection
            order: ['localStorage', 'navigator'],
            // Keys to look for in localStorage
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
            // Cache user language in localStorage
            caches: ['localStorage'],
        },

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        // React settings
        react: {
            useSuspense: false, // Disable suspense for SSR compatibility
        },
    });

/**
 * Change the application language
 * @param languageCode - The language code to switch to
 */
export const changeLanguage = (languageCode: LanguageCode): void => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
};

/**
 * Get the current language
 * @returns The current language code
 */
export const getCurrentLanguage = (): LanguageCode => {
    return (i18n.language || DEFAULT_LANGUAGE) as LanguageCode;
};

/**
 * Get language info by code
 * @param code - The language code
 * @returns The language info or undefined
 */
export const getLanguageInfo = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export default i18n;
