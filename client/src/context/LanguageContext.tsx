import React, { createContext, useState, useEffect } from "react";
import i18n from "i18next";

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
  const detectInitialLanguage = (): string => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && ["en", "ru", "uz"].includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Try to detect from browser
    const browserLang = navigator.language.split("-")[0];
    if (["en", "ru", "uz"].includes(browserLang)) {
      return browserLang;
    }
    
    return "en"; // Default
  };

  const [currentLanguage, setCurrentLanguage] = useState(detectInitialLanguage());

  // Compute directional properties based on language
  const getDirections = (lang: string) => {
    const isRtl = lang === "ar";
    return {
      start: isRtl ? "right" : "left",
      end: isRtl ? "left" : "right",
      dir: isRtl ? "rtl" : "ltr",
      textAlign: isRtl ? "right" : "left",
    } as const;
  };

  const directions = getDirections(currentLanguage);

  // Update i18n language when currentLanguage changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = directions.dir;
    i18n.changeLanguage(currentLanguage);
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage, directions.dir]);

  const setLanguage = (lang: string) => {
    if (["en", "ru", "uz"].includes(lang)) {
      setCurrentLanguage(lang);
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
