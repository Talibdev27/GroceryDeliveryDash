import { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

export function useLanguage() {
  const context = useContext(LanguageContext);
  const { t } = useTranslation();
  
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  
  return {
    ...context,
    t,
  };
}
