import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import healthSchemesData from "@/data/health_schemes.json";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import SchemeDetailDialog from "./SchemeDetailDialog";
import { Bookmark, BookmarkCheck, ArrowRight, StarIcon, StarsIcon } from "lucide-react";

// Define the HealthScheme type
interface HealthScheme {
  id: string;
  name: string;
  shortDescription: string;
  category: string[];
  coverage: string;
  eligibility: string[];
  benefits: string[];
  applicationProcess: string[];
  contactInformation: {
    website: string;
    helpline: string;
    email: string;
  };
  officialLinks: {
    mainWebsite: string;
    [key: string]: string;
  };
  languages: {
    [key: string]: {
      name: string;
      shortDescription: string;
    };
  };
  imageUrl: string;
  featured: boolean;
}

export default function FeaturedSchemes() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [featuredSchemes, setFeaturedSchemes] = useState<HealthScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<HealthScheme | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Use local storage for bookmarks
  const [bookmarkedSchemes, setBookmarkedSchemes] = useLocalStorage<string[]>("bookmarked-health-schemes", []);
  
  // Fetch featured schemes
  useEffect(() => {
    // Filter schemes marked as featured
    const featured = (healthSchemesData as HealthScheme[]).filter(
      scheme => scheme.featured
    );
    setFeaturedSchemes(featured);
  }, []);
  
  // Toggle bookmark status for a scheme
  const toggleBookmark = (schemeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (bookmarkedSchemes.includes(schemeId)) {
      setBookmarkedSchemes(bookmarkedSchemes.filter(id => id !== schemeId));
      toast({
        title: "Bookmark Removed",
        description: "The scheme has been removed from your bookmarks.",
      });
    } else {
      setBookmarkedSchemes([...bookmarkedSchemes, schemeId]);
      toast({
        title: "Scheme Bookmarked",
        description: "The scheme has been added to your bookmarks for easy access.",
      });
    }
  };
  
  // Handle scheme selection for detailed view
  const handleSchemeClick = (scheme: HealthScheme) => {
    setSelectedScheme(scheme);
    setIsDetailOpen(true);
  };
  
  return (
    <div className="space-y-8">
      {/* Hero Featured Scheme */}
      {featuredSchemes.length > 0 && (
        <div 
          className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/80 to-primary border cursor-pointer"
          onClick={() => handleSchemeClick(featuredSchemes[0])}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80">
            <div className="absolute top-0 right-0 p-4">
              <Badge className="bg-yellow-400 hover:bg-yellow-500 text-black border-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                Featured Scheme
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {featuredSchemes[0].languages[language]?.name || featuredSchemes[0].name}
              </h2>
              <p className="text-white/90 mb-4">
                {featuredSchemes[0].languages[language]?.shortDescription || featuredSchemes[0].shortDescription}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {featuredSchemes[0].category.map((cat) => (
                  <Badge key={cat} variant="outline" className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                    {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSchemeClick(featuredSchemes[0]);
                  }}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => toggleBookmark(featuredSchemes[0].id, e)}
                  className="border-white/50 text-white hover:bg-white/20"
                >
                  {bookmarkedSchemes.includes(featuredSchemes[0].id) ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="mr-2 h-4 w-4" />
                      Bookmark
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="md:h-80 bg-gradient-to-l from-primary-dark/20 to-transparent p-4 flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 h-full w-full flex items-center justify-center">
                <div className="text-xl md:text-2xl font-bold text-white text-center">
                  Coverage: {featuredSchemes[0].coverage}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* More Featured Schemes */}
      {featuredSchemes.length > 1 && (
        <>
          <h3 className="text-lg font-medium">Other Featured Schemes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSchemes.slice(1).map((scheme) => (
              <Card 
                key={scheme.id}
                className="overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleSchemeClick(scheme)}
              >
                <div className="w-full h-40 overflow-hidden relative">
                  <img 
                    src={scheme.imageUrl} 
                    alt={scheme.languages[language]?.name || scheme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://www.nhp.gov.in/NHPfiles/health_wellness.jpg";
                    }}
                  />
                  <button 
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full z-10 transition-colors"
                    onClick={(e) => toggleBookmark(scheme.id, e)}
                  >
                    {bookmarkedSchemes.includes(scheme.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-400 hover:bg-yellow-500 text-black border-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                      Featured
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">
                    {scheme.languages[language]?.name || scheme.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {scheme.languages[language]?.shortDescription || scheme.shortDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2">
                    {scheme.category.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                        {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    ))}
                    {scheme.category.length > 2 && (
                      <Badge variant="outline" className="bg-muted hover:bg-muted/80">
                        +{scheme.category.length - 2} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="secondary" className="w-full text-sm">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Scheme Detail Dialog */}
      {selectedScheme && (
        <SchemeDetailDialog 
          scheme={selectedScheme}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          isBookmarked={bookmarkedSchemes.includes(selectedScheme.id)}
          onToggleBookmark={() => toggleBookmark(selectedScheme.id, { stopPropagation: () => {} } as any)}
        />
      )}
      
      {/* No Featured Schemes */}
      {featuredSchemes.length === 0 && (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No featured schemes available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            There are currently no featured health schemes. Please check the main list to browse all available schemes.
          </p>
        </div>
      )}
    </div>
  );
}