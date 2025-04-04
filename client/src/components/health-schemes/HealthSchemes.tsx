import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import healthSchemesData from "@/data/health_schemes.json";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SchemeDetailDialog from "./SchemeDetailDialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, BookmarkCheck, LayoutGrid, List, Search } from "lucide-react";
import { HealthScheme } from "./types";

interface HealthSchemesProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  filterBookmarked?: boolean;
}

export default function HealthSchemes({ viewMode, onViewModeChange, filterBookmarked = false }: HealthSchemesProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [filteredSchemes, setFilteredSchemes] = useState<HealthScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<HealthScheme | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Use local storage for bookmarks
  const [bookmarkedSchemes, setBookmarkedSchemes] = useLocalStorage<string[]>("bookmarked-health-schemes", []);
  
  // Effect to filter schemes based on search, category, and bookmarks
  useEffect(() => {
    let result = [...healthSchemesData] as HealthScheme[];
    
    // Filter by bookmarks if required
    if (filterBookmarked) {
      result = result.filter((scheme) => bookmarkedSchemes.includes(scheme.id));
    }
    
    // Filter by category if selected
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter((scheme) => scheme.category.includes(categoryFilter));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((scheme) => {
        // Get translated name and description if available
        const name = language !== "english" && scheme.languages[language]?.name
          ? scheme.languages[language].name 
          : scheme.name;
        const description = language !== "english" && scheme.languages[language]?.shortDescription
          ? scheme.languages[language].shortDescription
          : scheme.shortDescription;
        
        return (
          name.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          scheme.category.some(cat => cat.toLowerCase().includes(query)) ||
          scheme.eligibility.some(item => item.toLowerCase().includes(query)) ||
          scheme.benefits.some(item => item.toLowerCase().includes(query))
        );
      });
    }
    
    setFilteredSchemes(result);
  }, [searchQuery, categoryFilter, bookmarkedSchemes, filterBookmarked, language]);
  
  // Get categories for filter dropdown
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    healthSchemesData.forEach((scheme: any) => {
      scheme.category.forEach((cat: string) => categories.add(cat));
    });
    return Array.from(categories).sort();
  };
  
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
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search health schemes by name or keywords..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              <SelectItem value="all">All Categories</SelectItem>
              {getUniqueCategories().map(category => (
                <SelectItem key={category} value={category}>
                  {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <div className="flex items-center border rounded-md p-1">
          <Button 
            variant={viewMode === "grid" ? "default" : "ghost"} 
            size="sm" 
            className="px-2"
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "ghost"} 
            size="sm" 
            className="px-2"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Schemes Display */}
      {filteredSchemes.length > 0 ? (
        viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <Card 
                key={scheme.id} 
                className="overflow-hidden border hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => handleSchemeClick(scheme)}
              >
                <div className="relative h-36">
                  <img 
                    src={scheme.imageUrl} 
                    alt={scheme.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://www.nhp.gov.in/NHPfiles/health_wellness.jpg"; // Fallback image
                    }}
                  />
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
                <CardHeader className="py-3">
                  <CardTitle className="text-base line-clamp-1">{getLocalizedName(scheme)}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {getLocalizedDescription(scheme)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {scheme.category.map((cat) => (
                      <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                        {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    <strong>Coverage:</strong> {scheme.coverage}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-3">
                  <Button variant="secondary" className="text-sm w-full">
                    View Full Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredSchemes.map((scheme) => (
              <Card 
                key={scheme.id} 
                className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => handleSchemeClick(scheme)}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-1/4 h-32 md:h-auto">
                    <img 
                      src={scheme.imageUrl} 
                      alt={scheme.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://www.nhp.gov.in/NHPfiles/health_wellness.jpg"; // Fallback image
                      }}
                    />
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
                  
                  <div className="flex-1 p-4">
                    <h3 className="text-lg font-semibold mb-2">{getLocalizedName(scheme)}</h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {getLocalizedDescription(scheme)}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {scheme.category.map((cat) => (
                        <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                          {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm font-medium block">Coverage:</span>
                        <span className="text-sm">{scheme.coverage}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium block">Contact:</span>
                        <span className="text-sm">{scheme.contactInformation.helpline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No health schemes found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search criteria or filter settings to find health schemes that match your needs.
          </p>
          {filterBookmarked && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setCategoryFilter("all");
                setSearchQuery("");
              }}
            >
              View All Schemes
            </Button>
          )}
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