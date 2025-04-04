import React, { useState, useEffect, useMemo } from 'react';
import { HealthScheme, ViewMode, SortOption } from './types';
import { useLanguage } from '../../context/LanguageContext';
import { useLocalStorage } from '../../hooks/use-local-storage';
import SchemeDetailDialog from './SchemeDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookmarkCheck, BookmarkPlus, Grid, List, Search, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import health schemes data and utilities
import healthSchemesData from '../../data/health_schemes.json';
import { normalizeHealthSchemeData } from './utils';

const HealthSchemes: React.FC = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('health-schemes-view-mode', 'grid');
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [selectedScheme, setSelectedScheme] = useState<HealthScheme | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookmarkedSchemes, setBookmarkedSchemes] = useLocalStorage<{id: string, dateBookmarked: string}[]>('bookmarked-schemes', []);
  const [showBookmarked, setShowBookmarked] = useState(false);
  
  // Collect all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    const normalizedData = normalizeHealthSchemeData(healthSchemesData);
    normalizedData.forEach(scheme => {
      scheme.category.forEach(category => categories.add(category));
    });
    return Array.from(categories).sort();
  }, []);
  
  // Filter and sort schemes
  const filteredSchemes = useMemo(() => {
    let schemes = normalizeHealthSchemeData(healthSchemesData);
    
    // Filter by search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      schemes = schemes.filter(scheme => {
        const nameMatch = scheme.name.toLowerCase().includes(lowercasedSearchTerm);
        const descMatch = scheme.shortDescription.toLowerCase().includes(lowercasedSearchTerm);
        return nameMatch || descMatch;
      });
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      schemes = schemes.filter(scheme => 
        scheme.category.some(category => selectedCategories.includes(category))
      );
    }
    
    // Filter bookmarked schemes
    if (showBookmarked) {
      const bookmarkedIds = bookmarkedSchemes.map(bookmark => bookmark.id);
      schemes = schemes.filter(scheme => bookmarkedIds.includes(scheme.id));
    }
    
    // Sort schemes
    if (sortOption === 'name') {
      schemes = [...schemes].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'featured') {
      schemes = [...schemes].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    
    return schemes;
  }, [healthSchemesData, searchTerm, selectedCategories, sortOption, showBookmarked, bookmarkedSchemes]);
  
  const toggleBookmark = (scheme: HealthScheme, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const isBookmarked = bookmarkedSchemes.some(bookmark => bookmark.id === scheme.id);
    
    if (isBookmarked) {
      setBookmarkedSchemes(bookmarkedSchemes.filter(bookmark => bookmark.id !== scheme.id));
    } else {
      const newBookmark = {
        id: scheme.id,
        dateBookmarked: new Date().toISOString()
      };
      setBookmarkedSchemes([...bookmarkedSchemes, newBookmark]);
    }
  };
  
  const openSchemeDetails = (scheme: HealthScheme) => {
    setSelectedScheme(scheme);
    setDialogOpen(true);
  };
  
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
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
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setShowBookmarked(false);
    setSortOption('featured');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col mb-6 space-y-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search health schemes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {(selectedCategories.length > 0 || showBookmarked) && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedCategories.length + (showBookmarked ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[200px] overflow-y-auto">
                  <DropdownMenuGroup>
                    {allCategories.map(category => (
                      <DropdownMenuCheckboxItem
                        key={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      >
                        {category}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={showBookmarked}
                  onCheckedChange={() => setShowBookmarked(!showBookmarked)}
                >
                  <div className="flex items-center">
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                    <span>Bookmarked Only</span>
                  </div>
                </DropdownMenuCheckboxItem>
                {(selectedCategories.length > 0 || showBookmarked) && (
                  <>
                    <DropdownMenuSeparator />
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center mt-2" 
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="name">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {filteredSchemes.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No Schemes Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
            {(searchTerm || selectedCategories.length > 0 || showBookmarked) && (
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredSchemes.map((scheme) => {
                  const isBookmarked = bookmarkedSchemes.some(bookmark => bookmark.id === scheme.id);
                  const localizedContent = getLocalizedContent(scheme);
                  
                  return (
                    <Card 
                      key={scheme.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
                      onClick={() => openSchemeDetails(scheme)}
                    >
                      <div className="h-36 overflow-hidden relative">
                        <img 
                          src={scheme.imageUrl} 
                          alt={scheme.name} 
                          className="w-full h-full object-cover" 
                        />
                        {scheme.featured && (
                          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{localizedContent.name}</CardTitle>
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
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground line-clamp-3">
                          {localizedContent.shortDescription}
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2 pt-0">
                        {scheme.category.slice(0, 3).map((category) => (
                          <Badge key={category} variant="outline" className="bg-primary/5">
                            {category}
                          </Badge>
                        ))}
                        {scheme.category.length > 3 && (
                          <Badge variant="outline">+{scheme.category.length - 3}</Badge>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                <Accordion type="multiple" className="w-full">
                  {filteredSchemes.map((scheme) => {
                    const isBookmarked = bookmarkedSchemes.some(bookmark => bookmark.id === scheme.id);
                    const localizedContent = getLocalizedContent(scheme);
                    
                    return (
                      <AccordionItem key={scheme.id} value={scheme.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center">
                              <img 
                                src={scheme.imageUrl} 
                                alt={scheme.name}
                                className="w-12 h-12 object-contain mr-4"
                              />
                              <div className="text-left">
                                <div className="font-medium">{localizedContent.name}</div>
                                <div className="flex mt-1 flex-wrap gap-1">
                                  {scheme.category.slice(0, 2).map((category) => (
                                    <Badge key={category} variant="outline" className="text-xs">
                                      {category}
                                    </Badge>
                                  ))}
                                  {scheme.category.length > 2 && (
                                    <Badge variant="outline" className="text-xs">+{scheme.category.length - 2}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {scheme.featured && (
                                <Badge className="bg-primary text-primary-foreground">
                                  Featured
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => toggleBookmark(scheme, e)}
                                className="h-8 w-8"
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="h-4 w-4 text-primary" />
                                ) : (
                                  <BookmarkPlus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 px-4 pb-2">
                            <p>{localizedContent.shortDescription}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {scheme.category.map((category) => (
                                <Badge key={category} variant="outline" className="bg-primary/5">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                            <Button onClick={() => openSchemeDetails(scheme)}>View Details</Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            )}
          </>
        )}
      </div>
      
      <SchemeDetailDialog
        scheme={selectedScheme}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default HealthSchemes;