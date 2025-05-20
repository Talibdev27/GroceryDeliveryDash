import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

// Define our supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: 'us' },
  { code: 'ru', name: 'Russian', flag: 'ru' },
  { code: 'uz', name: 'Uzbek', flag: 'uz' }
];

interface LanguageSelectorProps {
  variant?: "header" | "mobile";
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = "header" 
}) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();
  
  const getFlagSrc = (code: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    const flag = language ? language.flag : 'us';
    return `https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/${flag}.svg`;
  };
  
  // Get current language name
  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  
  if (variant === "mobile") {
    return (
      <div className="flex flex-col space-y-2">
        <p className="font-medium text-neutral-800">Change Language</p>
        <div className="grid grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map(language => (
            <button 
              key={language.code}
              className={`flex items-center space-x-1 ${currentLanguage === language.code ? 'bg-primary text-white' : 'bg-neutral-100'} px-3 py-2 rounded hover:bg-primary/90 hover:text-white transition-colors`}
              onClick={() => setLanguage(language.code)}
            >
              <img src={getFlagSrc(language.code)} alt={language.name} className="w-4 h-4 rounded-sm" />
              <span className="ml-1">{language.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-1">
        <img src={getFlagSrc(currentLanguage)} alt={currentLang.name} className="w-4 h-4 rounded-sm" />
        <span className="ml-1">{currentLang.name}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {SUPPORTED_LANGUAGES.map(language => (
          <DropdownMenuItem 
            key={language.code}
            onClick={() => setLanguage(language.code)} 
            className="flex items-center space-x-2 p-2 hover:bg-neutral-100 rounded cursor-pointer"
          >
            <img src={getFlagSrc(language.code)} alt={language.name} className="w-4 h-4 rounded-sm" />
            <span className="ml-1">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;