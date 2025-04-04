import React, { useState } from 'react';
import { HealthScheme } from './types';
import { useLanguage } from '../../context/LanguageContext';
import { useLocalStorage } from '../../hooks/use-local-storage';
import SchemeDetailDialog from './SchemeDetailDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookmarkCheck, BookmarkPlus, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

// Import health schemes data and utilities
import healthSchemesData from '../../data/health_schemes.json';
import { normalizeHealthSchemeData } from './utils';

const FeaturedSchemes: React.FC = () => {
  const { language } = useLanguage();
  const [bookmarkedSchemes, setBookmarkedSchemes] = useLocalStorage<{id: string, dateBookmarked: string}[]>('bookmarked-schemes', []);
  const [selectedScheme, setSelectedScheme] = useState<HealthScheme | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Get only featured schemes (limited to 3)
  const featuredSchemes = normalizeHealthSchemeData(healthSchemesData)
    .filter(scheme => scheme.featured)
    .slice(0, 3);
  
  const toggleBookmark = (scheme: HealthScheme, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const isBookmarked = bookmarkedSchemes.some(bookmark => bookmark.id === scheme.id);
    
    if (isBookmarked) {
      setBookmarkedSchemes(bookmarkedSchemes.filter(bookmark => bookmark.id !== scheme.id));
    } else {
      const newBookmark = {
        id: scheme.id,
        dateBookmarked: new Date().toISOString(),
      };
      setBookmarkedSchemes([...bookmarkedSchemes, newBookmark]);
    }
  };
  
  const openSchemeDetails = (scheme: HealthScheme) => {
    setSelectedScheme(scheme);
    setDialogOpen(true);
  };
  
  // Get localized content
  const getLocalizedContent = (scheme: HealthScheme) => {
    if (language !== 'english' && scheme.languages[language]) {
      return {
        name: scheme.languages[language]?.name || scheme.name,
        shortDescription: scheme.languages[language]?.shortDescription || scheme.shortDescription
      };
    }
    return {
      name: scheme.name,
      shortDescription: scheme.shortDescription
    };
  };
  
  return (
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Featured Health Schemes</h2>
            <p className="text-muted-foreground mt-1">
              Discover government health schemes designed to improve healthcare access
            </p>
          </div>
          <Link href="/health-schemes">
            <Button variant="outline" className="gap-2">
              View All Schemes
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredSchemes.map((scheme) => {
            const isBookmarked = bookmarkedSchemes.some(bookmark => bookmark.id === scheme.id);
            const localizedContent = getLocalizedContent(scheme);
            
            return (
              <Card 
                key={scheme.id} 
                className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col h-full"
                onClick={() => openSchemeDetails(scheme)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={scheme.imageUrl} 
                    alt={scheme.name} 
                    className="w-full h-full object-cover object-center" 
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{localizedContent.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => toggleBookmark(scheme, e)}
                      className="h-8 w-8 -mt-1 -mr-2"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {localizedContent.shortDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {scheme.category.slice(0, 3).map((category) => (
                      <Badge key={category} variant="outline" className="bg-primary/5">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSchemeDetails(scheme);
                    }}
                  >
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      
      <SchemeDetailDialog
        scheme={selectedScheme}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default FeaturedSchemes;