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
  // Try to get language from localStorage, or detect from browser, or default to 'en'
  const detectInitialLanguage = (): SupportedLanguage => {
    // Clear any previously saved language that's not in our supported list
    const savedLanguage = localStorage.getItem("language");
    
    // Check if the saved language is one of our supported languages
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
      return savedLanguage as SupportedLanguage;
    }
    
    // Try to detect from browser, fallback to 'en'
    const browserLang = navigator.language.split("-")[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
      return browserLang as SupportedLanguage;
    }
    
    return "en"; // Default
  };

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(detectInitialLanguage());

  // Compute directional properties - all our languages are LTR
  const directions = {
    start: "left",
    end: "right",
    dir: "ltr" as const,
    textAlign: "left",
  };

  // Update i18n language when currentLanguage changes
  useEffect(() => {
    // Update HTML attributes
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = directions.dir;
    
    // Change i18next language
    i18n.changeLanguage(currentLanguage);
    
    // Save to localStorage
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: string) => {
    if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      setCurrentLanguage(lang as SupportedLanguage);
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
