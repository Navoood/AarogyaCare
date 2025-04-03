import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { user, updateUser } = useAuth();

  // Map of language codes to display names
  const languageNames: Record<string, string> = {
    english: "English",
    hindi: "हिन्दी (Hindi)",
    tamil: "தமிழ் (Tamil)",
    telugu: "తెలుగు (Telugu)",
    bengali: "বাংলা (Bengali)",
    marathi: "मराठी (Marathi)",
    gujarati: "ગુજરાતી (Gujarati)",
  };

  const handleLanguageChange = (language: string) => {
    changeLanguage(language as any);
    
    // Update user preference if logged in
    if (user) {
      updateUser({ language });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-1">
          <Languages className="h-4 w-4 mr-1" />
          <span>{languageNames[currentLanguage] || "English"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => handleLanguageChange(language)}
            className={
              currentLanguage === language ? "bg-primary-50 text-primary-600" : ""
            }
          >
            {languageNames[language]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
