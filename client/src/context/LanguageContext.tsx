import React, { createContext, useState, useEffect } from "react";
import i18n from "i18next";

// Define supported languages
const SUPPORTED_LANGUAGES = ["en", "ru", "uz"] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  directions: {
    start: string;
    end: string;
    dir: "ltr" | "rtl";
    textAlign: string;
  };
}

export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "en",
  setLanguage: () => {},
  directions: {
    start: "left",
    end: "right",
    dir: "ltr",
    textAlign: "left",
  },
});

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get language from localStorage, or default to 'en'
  const detectInitialLanguage = (): SupportedLanguage => {
    console.log("LanguageContext: Detecting initial language");
    
    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem("language");
    console.log("LanguageContext: Saved language from localStorage:", savedLanguage);
    
    // Check if the saved language is one of our supported languages
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
      console.log("LanguageContext: Using saved language:", savedLanguage);
      return savedLanguage as SupportedLanguage;
    }
    
    console.log("LanguageContext: Using default language: en");
    return "en"; // Default
  };

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(detectInitialLanguage());
  const [forceUpdate, setForceUpdate] = useState(0);

  // Initialize i18n with the detected language
  useEffect(() => {
    console.log("LanguageContext: Initializing i18n with language:", currentLanguage);
    i18n.changeLanguage(currentLanguage).then(() => {
      console.log("LanguageContext: i18n initialized with language:", currentLanguage);
      console.log("LanguageContext: Current i18n language:", i18n.language);
    });
  }, []); // Run only once on mount

  // Compute directional properties - all our languages are LTR
  const directions = {
    start: "left",
    end: "right",
    dir: "ltr" as const,
    textAlign: "left",
  };

  // Update i18n language when currentLanguage changes
  useEffect(() => {
    console.log("LanguageContext: Changing language to", currentLanguage);
    
    // Update HTML attributes
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = directions.dir;
    
    // Change i18next language
    i18n.changeLanguage(currentLanguage).then(() => {
      console.log("i18n: Language changed to", currentLanguage);
      console.log("i18n: Current language is now", i18n.language);
      
      // Test if translations are working
      const testTranslation = i18n.t('hero.title');
      console.log("i18n: Test translation for hero.title:", testTranslation);
      
      // Force a re-render to ensure all components update
      setForceUpdate(prev => prev + 1);
      
      // Force a re-render of all components
      console.log("LanguageContext: Forcing component re-render");
      setForceUpdate(prev => prev + 1);
    }).catch((error) => {
      console.error("i18n: Error changing language", error);
    });
    
    // Save to localStorage
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: string) => {
    console.log("LanguageContext: setLanguage called with", lang);
    if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      console.log("LanguageContext: Setting language to", lang);
      
      // Save to localStorage first
      localStorage.setItem("language", lang);
      
      // Update state immediately
      setCurrentLanguage(lang as SupportedLanguage);
      
      // Force i18n to change language
      i18n.changeLanguage(lang).then(() => {
        console.log("LanguageContext: i18n language changed to", lang);
        console.log("LanguageContext: i18n current language", i18n.language);
        
        // Test translation
        const testTranslation = i18n.t('hero.title');
        console.log("LanguageContext: Test translation:", testTranslation);
        
        // Force a re-render - React will handle the language change reactively
        setForceUpdate(prev => prev + 1);
        
        // REMOVED: window.location.reload() - let React handle the language change
        console.log("LanguageContext: Language change complete, React will handle re-rendering");
      }).catch((error) => {
        console.error("LanguageContext: Error changing language", error);
      });
    } else {
      console.warn("LanguageContext: Unsupported language", lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        directions,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
