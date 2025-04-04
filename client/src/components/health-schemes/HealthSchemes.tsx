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

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(scheme => {
        const nameMatch = scheme.languages[language]?.name.toLowerCase().includes(query) || 
                          scheme.name.toLowerCase().includes(query);
        const descMatch = scheme.languages[language]?.shortDescription.toLowerCase().includes(query) || 
                          scheme.shortDescription.toLowerCase().includes(query);
        const categoryMatch = scheme.category.some(cat => cat.toLowerCase().includes(query));
        
        return nameMatch || descMatch || categoryMatch;
      });
    }
    
    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter(scheme => 
        scheme.category.includes(categoryFilter)
      );
    }
    
    // Filter by bookmarks if requested
    if (filterBookmarked) {
      result = result.filter(scheme => bookmarkedSchemes.includes(scheme.id));
    }
    
    setFilteredSchemes(result);
  }, [searchQuery, categoryFilter, language, bookmarkedSchemes, filterBookmarked]);
  
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

  // Get categories for filter dropdown
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    healthSchemesData.forEach((scheme: HealthScheme) => {
      scheme.category.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
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
        
        <div className="flex space-x-1">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("grid")}
            className="h-10 w-10"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
            className="h-10 w-10"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} 
        {categoryFilter !== 'all' && ` in category: ${categoryFilter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`}
        {filterBookmarked && ' in your bookmarks'}
      </div>
      
      {/* Schemes Grid or List */}
      {filteredSchemes.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
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
                  <ScrollArea className="whitespace-nowrap pb-2">
                    <div className="flex gap-2">
                      {scheme.category.map((cat) => (
                        <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                          {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="secondary" className="w-full text-sm">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSchemes.map((scheme) => (
              <Card 
                key={scheme.id}
                className="hover:shadow-md transition-all cursor-pointer overflow-hidden"
                onClick={() => handleSchemeClick(scheme)}
              >
                <div className="md:flex">
                  <div className="md:w-1/4 h-40 md:h-auto overflow-hidden">
                    <img 
                      src={scheme.imageUrl} 
                      alt={scheme.languages[language]?.name || scheme.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://www.nhp.gov.in/NHPfiles/health_wellness.jpg";
                      }}
                    />
                  </div>
                  <div className="flex flex-col md:w-3/4">
                    <CardHeader className="pb-2 flex flex-row justify-between items-start">
                      <div>
                        <CardTitle>
                          {scheme.languages[language]?.name || scheme.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {scheme.languages[language]?.shortDescription || scheme.shortDescription}
                        </CardDescription>
                      </div>
                      <button 
                        className="p-1.5 bg-muted hover:bg-muted/80 rounded-full z-10 transition-colors ml-2 mt-1"
                        onClick={(e) => toggleBookmark(scheme.id, e)}
                      >
                        {bookmarkedSchemes.includes(scheme.id) ? (
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <Bookmark className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <div className="flex flex-wrap gap-2 mb-2">
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
                    <CardFooter className="pt-0">
                      <Button variant="secondary" className="text-sm">
                        View Full Details
                      </Button>
                    </CardFooter>
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
                if (filterBookmarked) {
                  // Go to all schemes tab if there are no bookmarked schemes
                  const allTab = document.querySelector('[data-value="all-schemes"]');
                  if (allTab) {
                    (allTab as HTMLElement).click();
                  }
                }
              }}
            >
              Browse All Schemes
            </Button>
          )}
        </div>
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
    </div>
  );
}