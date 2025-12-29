import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import en from "@/data/locales/en.json";
import ru from "@/data/locales/ru.json";
import uz from "@/data/locales/uz.json";

// Get initial language from localStorage
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage && ["en", "ru", "uz"].includes(savedLanguage)) {
    return savedLanguage;
  }
  return "en";
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz }
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "uz"],
    lng: getInitialLanguage(),
    
    interpolation: {
      escapeValue: false
    },
    
    debug: false,
    
    // React integration - ensures components re-render on language change
    react: {
      useSuspense: false, // Don't use Suspense, we handle loading ourselves
    },
    
    // Force reload when language changes
    saveMissing: false,
    missingKeyHandler: false
  })
  .catch((error) => {
    console.error("i18n: Initialization error:", error);
  });

export default i18n;
