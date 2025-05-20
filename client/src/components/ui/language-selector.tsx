import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  variant?: "header" | "mobile";
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = "header" 
}) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  
  const getFlagSrc = (code: string) => {
    const flagMap = {
      en: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/us.svg",
      es: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/es.svg",
      ar: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/sa.svg"
    };
    return flagMap[code as keyof typeof flagMap];
  };
  
  // Get current language name
  const languageName = t(`languages.${language}`);
  
  if (variant === "mobile") {
    return (
      <div className="flex flex-col space-y-2">
        <p className="font-medium text-neutral-800">{t("mobileMenu.changeLanguage")}</p>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button 
            className={`flex items-center space-x-1 rtl:space-x-reverse ${language === 'en' ? 'bg-primary text-white' : 'bg-neutral-100'} px-3 py-2 rounded hover:bg-primary/90 hover:text-white transition-colors`}
            onClick={() => setLanguage('en')}
          >
            <img src={getFlagSrc('en')} alt="English" className="w-4 h-4 rounded-sm" />
            <span>{t("languages.en")}</span>
          </button>
          <button 
            className={`flex items-center space-x-1 rtl:space-x-reverse ${language === 'es' ? 'bg-primary text-white' : 'bg-neutral-100'} px-3 py-2 rounded hover:bg-primary/90 hover:text-white transition-colors`}
            onClick={() => setLanguage('es')}
          >
            <img src={getFlagSrc('es')} alt="Spanish" className="w-4 h-4 rounded-sm" />
            <span>{t("languages.es")}</span>
          </button>
          <button 
            className={`flex items-center space-x-1 rtl:space-x-reverse ${language === 'ar' ? 'bg-primary text-white' : 'bg-neutral-100'} px-3 py-2 rounded hover:bg-primary/90 hover:text-white transition-colors`}
            onClick={() => setLanguage('ar')}
          >
            <img src={getFlagSrc('ar')} alt="Arabic" className="w-4 h-4 rounded-sm" />
            <span>{t("languages.ar")}</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-1 rtl:space-x-reverse">
        <img src={getFlagSrc(language)} alt={languageName} className="w-4 h-4 rounded-sm" />
        <span>{languageName}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setLanguage('en')} className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-neutral-100 rounded cursor-pointer">
          <img src={getFlagSrc('en')} alt="English" className="w-4 h-4 rounded-sm" />
          <span>{t("languages.en")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')} className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-neutral-100 rounded cursor-pointer">
          <img src={getFlagSrc('es')} alt="Spanish" className="w-4 h-4 rounded-sm" />
          <span>{t("languages.es")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ar')} className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-neutral-100 rounded cursor-pointer">
          <img src={getFlagSrc('ar')} alt="Arabic" className="w-4 h-4 rounded-sm" />
          <span>{t("languages.ar")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
