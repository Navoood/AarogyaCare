import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { useLanguage, type Language } from "../../context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Menu, 
  User, 
  LogOut, 
  Globe, 
  Stethoscope, 
  Activity, 
  Apple, 
  Video, 
  PillIcon, 
  MessageSquareText,
  BellRing
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language, setLanguage, isRtl } = useLanguage();
  const [location, setLocation] = useLocation();
  
  // Define available languages
  const availableLanguages: Language[] = [
    "english", "hindi", "tamil", "telugu", "bengali", "marathi"
  ];
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on initial load and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const navigationItems = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Doctors", path: "/doctors", icon: <Stethoscope className="h-5 w-5" /> },
    { name: "Symptom Checker", path: "/symptom-checker", icon: <Activity className="h-5 w-5" /> },
    { name: "Diet Plans", path: "/diet-plans", icon: <Apple className="h-5 w-5" /> },
    { name: "Consultations", path: "/consultations", icon: <Video className="h-5 w-5" /> },
    { name: "Reminders", path: "/reminders", icon: <PillIcon className="h-5 w-5" /> },
    { name: "Community Forum", path: "/forum", icon: <MessageSquareText className="h-5 w-5" /> },
    { name: "Emergency", path: "/emergency", icon: <BellRing className="h-5 w-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-background sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto flex h-16 items-center px-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-primary text-xl md:text-2xl">AAROGYA</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.slice(0, 4).map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="mr-1">More</span>
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navigationItems.slice(4).map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link href={item.path} className="cursor-pointer flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableLanguages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang} 
                    onClick={() => setLanguage(lang)}
                    className={language === lang ? "bg-muted" : ""}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu or Login/Register */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Navigation Toggle */}
          <div className="flex md:hidden ml-auto">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-2 border-t">
                <div className="flex flex-col gap-2">
                  {!user ? (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-start">Register</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Language Selection in Mobile Menu */}
              <div className="pt-2 border-t">
                <p className="px-2 py-1 text-sm font-medium text-muted-foreground">Language</p>
                <div className="grid grid-cols-2 gap-1 pt-1">
                  {availableLanguages.map((lang) => (
                    <Button 
                      key={lang} 
                      variant={language === lang ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setLanguage(lang);
                        setIsOpen(false);
                      }}
                      className="justify-start"
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto px-4 md:flex md:items-center md:justify-between md:h-16">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AAROGYA. All rights reserved.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <nav className="flex justify-center md:justify-end space-x-4 text-sm font-medium">
              <Link href="/about" className="text-muted-foreground hover:text-primary">
                About
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}