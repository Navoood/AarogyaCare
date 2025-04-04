import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the languages supported by the application
export type Language = "english" | "hindi" | "tamil" | "telugu" | "bengali" | "marathi";

// Define the LanguageContext type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isRtl: boolean;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "english",
  setLanguage: () => {},
  isRtl: false,
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language');
      return (savedLanguage as Language) || "english";
    }
    return "english";
  });
  
  // RTL languages check (none in our currently supported languages)
  const isRtl = false;
  
  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
    
    // Update <html> lang attribute for accessibility
    document.documentElement.lang = language === "english" ? "en" : language;
    
    // Update direction for RTL languages
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [language, isRtl]);
  
  // Language setter with validation
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Export dictionary map for translating UI elements
export const languageLabels: Record<Language, { name: string; nativeName: string }> = {
  english: { name: "English", nativeName: "English" },
  hindi: { name: "Hindi", nativeName: "हिन्दी" },
  tamil: { name: "Tamil", nativeName: "தமிழ்" },
  telugu: { name: "Telugu", nativeName: "తెలుగు" },
  bengali: { name: "Bengali", nativeName: "বাংলা" },
  marathi: { name: "Marathi", nativeName: "मराठी" },
};