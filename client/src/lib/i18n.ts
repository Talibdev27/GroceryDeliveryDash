import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import en from "@/data/locales/en.json";
import ru from "@/data/locales/ru.json";
import uz from "@/data/locales/uz.json";

console.log("i18n: Loading translations...");
console.log("i18n: English hero.title:", en.hero.title);
console.log("i18n: Russian hero.title:", ru.hero.title);
console.log("i18n: Uzbek hero.title:", uz.hero.title);

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
    
    debug: true,
    
    // Force reload when language changes
    saveMissing: false,
    missingKeyHandler: false
  })
  .then(() => {
    console.log("i18n: Initialized successfully");
    console.log("i18n: Current language:", i18n.language);
    console.log("i18n: Available languages:", i18n.languages);
    
    // Test all translations
    console.log("i18n: Testing translations...");
    console.log("i18n: English hero.title:", i18n.t('hero.title', { lng: 'en' }));
    console.log("i18n: Russian hero.title:", i18n.t('hero.title', { lng: 'ru' }));
    console.log("i18n: Uzbek hero.title:", i18n.t('hero.title', { lng: 'uz' }));
  })
  .catch((error) => {
    console.error("i18n: Initialization error:", error);
  });

export default i18n;
