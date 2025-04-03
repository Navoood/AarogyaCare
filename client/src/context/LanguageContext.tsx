import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "../lib/queryClient";

type Language = "english" | "hindi" | "tamil" | "telugu" | "bengali" | "marathi" | "gujarati";

interface LanguageContextType {
  currentLanguage: Language;
  translations: Record<string, string>;
  changeLanguage: (language: Language) => void;
  t: (key: string) => string;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Default translations for fallback
const defaultTranslations: Record<string, Record<string, string>> = {
  english: {
    dashboard: "Dashboard",
    doctors: "Find Doctors",
    symptomChecker: "Symptom Checker",
    dietPlans: "Diet Plans",
    consultations: "Consultations",
    reminders: "Reminders",
    community: "Community",
    govtSchemes: "Gov. Schemes",
    analytics: "Analytics",
    profile: "Profile",
    login: "Login",
    register: "Register",
    logout: "Logout",
    email: "Email",
    password: "Password",
    username: "Username",
    fullName: "Full Name",
    phone: "Phone",
    address: "Address",
    role: "Role",
    patient: "Patient",
    doctor: "Doctor",
    admin: "Admin",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    filter: "Filter",
    sortBy: "Sort By",
    ascending: "Ascending",
    descending: "Descending",
    booking: "Book Appointment",
    available: "Available",
    unavailable: "Unavailable",
    emergency: "Emergency",
  },
  hindi: {
    dashboard: "डैशबोर्ड",
    doctors: "डॉक्टर्स",
    symptomChecker: "लक्षण जांचकर्ता",
    dietPlans: "आहार योजना",
    consultations: "परामर्श",
    reminders: "रिमाइंडर्स",
    community: "समुदाय",
    govtSchemes: "सरकारी योजनाएं",
    analytics: "विश्लेषण",
    profile: "प्रोफाइल",
    login: "लॉगिन",
    register: "रजिस्टर",
    logout: "लॉगआउट",
    email: "ईमेल",
    password: "पासवर्ड",
    username: "उपयोगकर्ता नाम",
    fullName: "पूरा नाम",
    phone: "फ़ोन",
    address: "पता",
    role: "भूमिका",
    patient: "रोगी",
    doctor: "डॉक्टर",
    admin: "व्यवस्थापक",
    submit: "सबमिट",
    cancel: "रद्द करें",
    save: "सहेजें",
    edit: "संपादित करें",
    delete: "हटाएं",
    search: "खोज",
    filter: "फ़िल्टर",
    sortBy: "क्रमबद्ध करें",
    ascending: "आरोही",
    descending: "अवरोही",
    booking: "अपॉइंटमेंट बुक करें",
    available: "उपलब्ध",
    unavailable: "अनुपलब्ध",
    emergency: "आपातकाल",
  }
};

const availableLanguages: Language[] = [
  "english", 
  "hindi", 
  "tamil", 
  "telugu", 
  "bengali", 
  "marathi", 
  "gujarati"
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("english");
  const [translations, setTranslations] = useState<Record<string, string>>(
    defaultTranslations.english
  );

  const fetchTranslations = async (language: Language) => {
    try {
      // Try to fetch from API first, but fallback to defaults if it fails
      try {
        const res = await fetch(`/api/translations/${language}`, {
          credentials: "include"
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.translations && Object.keys(data.translations).length > 0) {
            setTranslations(data.translations);
            return;
          }
        }
      } catch (fetchError) {
        console.error(`Failed to fetch ${language} translations:`, fetchError);
      }
      
      // Fallback to default translations if API call fails or returns empty data
      setTranslations(defaultTranslations[language] || defaultTranslations.english);
    } catch (error) {
      console.error(`Error in fetchTranslations:`, error);
      // Final fallback to English
      setTranslations(defaultTranslations.english);
    }
  };

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    fetchTranslations(language);
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        translations,
        changeLanguage,
        t,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
