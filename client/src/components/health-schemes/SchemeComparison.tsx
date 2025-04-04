import React, { useState } from 'react';
import { HealthScheme } from './types';
import { useLanguage } from '../../context/LanguageContext';
import { useLocalStorage } from '../../hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Check, MinusCircle, Info, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import health schemes data and utilities
import healthSchemesData from '../../data/health_schemes.json';
import { normalizeHealthSchemeData } from './utils';

const SchemeComparison: React.FC = () => {
  const { language } = useLanguage();
  const [bookmarkedSchemes] = useLocalStorage<{id: string, dateBookmarked: string}[]>('bookmarked-schemes', []);
  const [selectedSchemes, setSelectedSchemes] = useState<string[]>([]);
  
  // Get all schemes and bookmarked schemes
  const allSchemes = normalizeHealthSchemeData(healthSchemesData);
  const bookmarkedSchemesList = allSchemes.filter(scheme => 
    bookmarkedSchemes.some(bookmark => bookmark.id === scheme.id)
  );
  
  // Add a scheme to comparison
  const addScheme = (schemeId: string) => {
    if (selectedSchemes.length < 3 && !selectedSchemes.includes(schemeId)) {
      setSelectedSchemes([...selectedSchemes, schemeId]);
    }
  };
  
  // Remove a scheme from comparison
  const removeScheme = (schemeId: string) => {
    setSelectedSchemes(selectedSchemes.filter(id => id !== schemeId));
  };
  
  // Get schemes to compare
  const schemesToCompare = selectedSchemes.map(id => 
    allSchemes.find(scheme => scheme.id === id)
  ).filter((scheme): scheme is HealthScheme => scheme !== undefined);
  
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
  
  // Function to render a cell with a list
  const renderListCell = (items: string[]) => (
    <ul className="list-disc pl-5 space-y-1 text-sm">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">Compare Health Schemes</h2>
        
        {selectedSchemes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                How to Compare Schemes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Select up to 3 health schemes to compare their features side by side.</p>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <p>Select schemes from the dropdown below or from your bookmarked schemes</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <p>View side-by-side comparison of benefits, eligibility, and more</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <p>Make informed decisions about which health schemes best suit your needs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedSchemes.map((schemeId, index) => {
                  const scheme = allSchemes.find(s => s.id === schemeId);
                  if (!scheme) return null;
                  
                  const localizedContent = getLocalizedContent(scheme);
                  
                  return (
                    <div key={scheme.id} className="relative">
                      <Card className="h-full">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2"
                          onClick={() => removeScheme(scheme.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <CardHeader className="pb-2 pt-6">
                          <CardTitle className="text-lg">{localizedContent.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-20 overflow-hidden mb-4">
                            <img 
                              src={scheme.imageUrl} 
                              alt={scheme.name} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {localizedContent.shortDescription}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
                
                {Array.from({ length: 3 - selectedSchemes.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="border-2 border-dashed rounded-md p-4 flex items-center justify-center">
                    <Select onValueChange={addScheme}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add scheme to compare" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSchemes
                          .filter(scheme => !selectedSchemes.includes(scheme.id))
                          .map(scheme => (
                            <SelectItem key={scheme.id} value={scheme.id}>
                              {scheme.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {selectedSchemes.length > 0 && (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">Basic Details</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="application">How to Apply</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="max-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-36">Feature</TableHead>
                          {schemesToCompare.map(scheme => (
                            <TableHead key={scheme.id}>{getLocalizedContent(scheme).name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Coverage</TableCell>
                          {schemesToCompare.map(scheme => (
                            <TableCell key={scheme.id}>{scheme.coverage}</TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Categories</TableCell>
                          {schemesToCompare.map(scheme => (
                            <TableCell key={scheme.id}>
                              {scheme.category.join(', ')}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1">
                              Contact
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Primary contact information</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          {schemesToCompare.map(scheme => (
                            <TableCell key={scheme.id}>
                              <div className="space-y-2 text-sm">
                                <div><span className="font-medium">Helpline:</span> {scheme.contactInformation.helpline}</div>
                                <div><span className="font-medium">Website:</span> {scheme.contactInformation.website}</div>
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="eligibility">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="max-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-36">Eligibility</TableHead>
                          {schemesToCompare.map(scheme => (
                            <TableHead key={scheme.id}>{getLocalizedContent(scheme).name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schemesToCompare.reduce((maxEligibility, scheme) => 
                          Math.max(maxEligibility, scheme.eligibility.length), 0
                        ) > 0 && (
                          <TableRow>
                            <TableCell className="font-medium">Criteria</TableCell>
                            {schemesToCompare.map(scheme => (
                              <TableCell key={scheme.id}>{renderListCell(scheme.eligibility)}</TableCell>
                            ))}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="benefits">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="max-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-36">Benefits</TableHead>
                          {schemesToCompare.map(scheme => (
                            <TableHead key={scheme.id}>{getLocalizedContent(scheme).name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schemesToCompare.reduce((maxBenefits, scheme) => 
                          Math.max(maxBenefits, scheme.benefits.length), 0
                        ) > 0 && (
                          <TableRow>
                            <TableCell className="font-medium">Key Benefits</TableCell>
                            {schemesToCompare.map(scheme => (
                              <TableCell key={scheme.id}>{renderListCell(scheme.benefits)}</TableCell>
                            ))}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="application">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="max-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-36">Application</TableHead>
                          {schemesToCompare.map(scheme => (
                            <TableHead key={scheme.id}>{getLocalizedContent(scheme).name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schemesToCompare.reduce((maxApplication, scheme) => 
                          Math.max(maxApplication, scheme.applicationProcess.length), 0
                        ) > 0 && (
                          <TableRow>
                            <TableCell className="font-medium">Process</TableCell>
                            {schemesToCompare.map(scheme => (
                              <TableCell key={scheme.id}>{renderListCell(scheme.applicationProcess)}</TableCell>
                            ))}
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell className="font-medium">Official Links</TableCell>
                          {schemesToCompare.map(scheme => (
                            <TableCell key={scheme.id}>
                              <div className="space-y-2 text-sm">
                                {Object.entries(scheme.officialLinks).map(([key, url]) => (
                                  <div key={key}>
                                    <div className="font-medium capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </div>
                                    <a 
                                      href={url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-primary hover:underline truncate block"
                                    >
                                      {url.replace(/^https?:\/\//, '')}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {bookmarkedSchemesList.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Your Bookmarked Schemes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bookmarkedSchemesList.map(scheme => {
              const localizedContent = getLocalizedContent(scheme);
              const isSelected = selectedSchemes.includes(scheme.id);
              
              return (
                <Card 
                  key={scheme.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    isSelected ? 'border-primary' : ''
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-md line-clamp-1">{localizedContent.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {localizedContent.shortDescription}
                    </p>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => isSelected ? removeScheme(scheme.id) : addScheme(scheme.id)}
                      disabled={selectedSchemes.length >= 3 && !isSelected}
                    >
                      {isSelected ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Added to Comparison
                        </>
                      ) : (
                        selectedSchemes.length >= 3 ? (
                          <>
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            Maximum 3 Schemes
                          </>
                        ) : (
                          "Add to Comparison"
                        )
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeComparison;