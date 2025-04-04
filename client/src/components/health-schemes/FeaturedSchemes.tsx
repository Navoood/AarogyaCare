import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import healthSchemesData from "@/data/health_schemes.json";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import SchemeDetailDialog from "./SchemeDetailDialog";
import { Bookmark, BookmarkCheck, ArrowRight, Star } from "lucide-react";
import { HealthScheme } from "./types";

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
  
  // Helper function to get translated name
  const getLocalizedName = (scheme: HealthScheme) => {
    if (language !== "english" && scheme.languages[language]?.name) {
      return scheme.languages[language].name;
    }
    return scheme.name;
  };
  
  // Helper function to get translated description
  const getLocalizedDescription = (scheme: HealthScheme) => {
    if (language !== "english" && scheme.languages[language]?.shortDescription) {
      return scheme.languages[language].shortDescription;
    }
    return scheme.shortDescription;
  };
  
  return (
    <div className="space-y-6">
      {featuredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredSchemes.map((scheme) => (
            <Card 
              key={scheme.id} 
              className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => handleSchemeClick(scheme)}
            >
              <div className="flex flex-col h-full">
                <div className="relative h-48">
                  <img 
                    src={scheme.imageUrl} 
                    alt={scheme.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://www.nhp.gov.in/NHPfiles/health_wellness.jpg"; // Fallback image
                    }}
                  />
                  <div className="absolute top-0 left-0 bg-primary text-white px-3 py-1 rounded-br-md flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-xs font-medium">Featured</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={(e) => toggleBookmark(scheme.id, e)}
                  >
                    {bookmarkedSchemes.includes(scheme.id) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{getLocalizedName(scheme)}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {getLocalizedDescription(scheme)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow pb-0">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {scheme.category.map((cat) => (
                      <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                        {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-sm font-medium block">Coverage:</span>
                      <span className="text-sm">{scheme.coverage}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium block">Key Benefit:</span>
                      <span className="text-sm line-clamp-1">{scheme.benefits[0]}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4 pb-4">
                  <Button variant="default" className="w-full justify-between group">
                    <span>View Scheme Details</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Star className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No featured schemes available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            There are currently no featured health schemes. Please check all schemes for complete information.
          </p>
        </div>
      )}
      
      {/* Detail Dialog */}
      <SchemeDetailDialog
        scheme={selectedScheme}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}