import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/data/locales/en.json";
import es from "@/data/locales/es.json";
import ar from "@/data/locales/ar.json";
import ru from "@/data/locales/ru.json";
import uz from "@/data/locales/uz.json";

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector) // detects user language
  .init({
    resources: {
      en: {
        translation: en
      },
      es: {
        translation: es
      },
      ar: {
        translation: ar
      },
      ru: {
        translation: ru
      },
      uz: {
        translation: uz
      }
    },
    fallbackLng: "en",
    supportedLngs: ["en", "es", "ar", "ru", "uz"],
    
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "language"
    }
  });

export default i18n;
