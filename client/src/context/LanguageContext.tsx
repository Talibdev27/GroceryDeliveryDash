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
  languageVersion: number; // Force re-render when language changes
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
  languageVersion: 0,
});

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get language from localStorage, or default to 'en'
  const detectInitialLanguage = (): SupportedLanguage => {
    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem("language");
    
    // Check if the saved language is one of our supported languages
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
      return savedLanguage as SupportedLanguage;
    }
    
    return "en"; // Default
  };

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(detectInitialLanguage());
  const [languageVersion, setLanguageVersion] = useState(0);

  // Initialize i18n with the detected language
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
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
    // Update HTML attributes
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = directions.dir;
    
    // Change i18next language
    i18n.changeLanguage(currentLanguage).then(() => {
      // Force a re-render by updating languageVersion
      setLanguageVersion(prev => prev + 1);
    }).catch((error) => {
      console.error("i18n: Error changing language", error);
    });
    
    // Save to localStorage
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: string) => {
    if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      // Save to localStorage first
      localStorage.setItem("language", lang);
      
      // Update state immediately
      setCurrentLanguage(lang as SupportedLanguage);
      
      // Force i18n to change language
      i18n.changeLanguage(lang).then(() => {
        // Force a re-render by updating languageVersion
        setLanguageVersion(prev => prev + 1);
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
        languageVersion, // This will change when language changes, forcing re-renders
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
