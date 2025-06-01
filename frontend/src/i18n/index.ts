import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslations
            },
            vi: {
                translation: viTranslations
            }
        },
        lng: 'vi',
        fallbackLng: 'vi',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n; 