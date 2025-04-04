import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import healthSchemesData from "@/data/health_schemes.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Plus, Trash2, FileDown, ArrowLeftRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

export default function SchemeComparison() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<HealthScheme[]>([]);
  const [selectedSchemes, setSelectedSchemes] = useState<HealthScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");
  
  // Fetch all schemes
  useEffect(() => {
    setSchemes(healthSchemesData as HealthScheme[]);
  }, []);
  
  // Handle adding a scheme to comparison
  const addSchemeToComparison = () => {
    if (!selectedSchemeId) return;
    
    // Find the selected scheme
    const scheme = schemes.find(s => s.id === selectedSchemeId);
    if (!scheme) return;
    
    // Check if the scheme is already in the comparison
    if (selectedSchemes.some(s => s.id === selectedSchemeId)) {
      toast({
        title: "Already Added",
        description: "This scheme is already in your comparison.",
        variant: "destructive",
      });
      return;
    }
    
    // Add scheme to comparison (max 3)
    if (selectedSchemes.length >= 3) {
      toast({
        title: "Maximum Schemes Reached",
        description: "You can compare up to 3 schemes at a time. Remove one to add another.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedSchemes([...selectedSchemes, scheme]);
    setSelectedSchemeId("");
    
    toast({
      title: "Scheme Added",
      description: "The scheme has been added to your comparison.",
    });
  };
  
  // Handle removing a scheme from comparison
  const removeSchemeFromComparison = (schemeId: string) => {
    setSelectedSchemes(selectedSchemes.filter(s => s.id !== schemeId));
    
    toast({
      title: "Scheme Removed",
      description: "The scheme has been removed from your comparison.",
    });
  };
  
  // Handle clearing all schemes from comparison
  const clearComparison = () => {
    setSelectedSchemes([]);
    toast({
      title: "Comparison Cleared",
      description: "All schemes have been removed from your comparison.",
    });
  };
  
  // Handle exporting comparison
  const exportComparison = () => {
    toast({
      title: "Export Started",
      description: "Preparing your comparison for download...",
    });
    
    // In a real implementation, you would generate a PDF or CSV here
    setTimeout(() => {
      toast({
        title: "Comparison Exported",
        description: "Your comparison has been exported successfully.",
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      {/* Scheme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Schemes to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={selectedSchemeId} onValueChange={setSelectedSchemeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a scheme to compare" />
                </SelectTrigger>
                <SelectContent>
                  {schemes.map((scheme) => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      {scheme.languages[language]?.name || scheme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={addSchemeToComparison}
              disabled={!selectedSchemeId}
              className="sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Comparison
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedSchemes.map((scheme, index) => (
              <Badge 
                key={scheme.id} 
                className="flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100/80"
              >
                <span>{scheme.languages[language]?.name || scheme.name}</span>
                <button
                  className="ml-2 h-4 w-4 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 flex items-center justify-center"
                  onClick={() => removeSchemeFromComparison(scheme.id)}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
          
          {selectedSchemes.length > 0 && (
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearComparison}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportComparison}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Comparison
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Comparison Table */}
      {selectedSchemes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowLeftRight className="mr-2 h-5 w-5" />
              Scheme Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-max">
                <table className="w-full border-collapse">
                  {/* Table Header */}
                  <thead>
                    <tr>
                      <th className="text-left p-3 bg-muted font-medium text-muted-foreground w-1/4">Feature</th>
                      {selectedSchemes.map((scheme) => (
                        <th key={scheme.id} className="text-left p-3 bg-muted font-medium text-primary-700 border-l">
                          <div>
                            {scheme.languages[language]?.name || scheme.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  {/* Table Body */}
                  <tbody>
                    {/* Description */}
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-muted/50">Description</td>
                      {selectedSchemes.map((scheme) => (
                        <td key={scheme.id} className="p-3 border-l">
                          {scheme.languages[language]?.shortDescription || scheme.shortDescription}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Coverage */}
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-muted/50">Coverage</td>
                      {selectedSchemes.map((scheme) => (
                        <td key={scheme.id} className="p-3 border-l">
                          <div className="font-medium text-primary-700">{scheme.coverage}</div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Categories */}
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-muted/50">Categories</td>
                      {selectedSchemes.map((scheme) => (
                        <td key={scheme.id} className="p-3 border-l">
                          <div className="flex flex-wrap gap-1">
                            {scheme.category.map((cat) => (
                              <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                                {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Eligibility */}
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-muted/50">Eligibility</td>
                      {selectedSchemes.map((scheme) => (
                        <td key={scheme.id} className="p-3 border-l">
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {scheme.eligibility.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Benefits */}
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-muted/50">Benefits</td>
                      {selectedSchemes.map((scheme) => (
                        <td key={scheme.id} className="p-3 border-l">
                          <ul className="space-y-1 text-sm">
                            {scheme.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Contact Information */}
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-muted/50">Contact Information</td>
                      {selectedSchemes.map((scheme) => (
                        <td key={scheme.id} className="p-3 border-l">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Helpline:</span> {scheme.contactInformation.helpline}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {scheme.contactInformation.email}
                            </div>
                            <div>
                              <a 
                                href={scheme.contactInformation.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Official Website
                              </a>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Application Process */}
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-muted/50">Application Process</td>
                      {selectedSchemes.map((scheme) => (
                        <td key={scheme.id} className="p-3 border-l">
                          <ol className="list-decimal pl-5 space-y-1 text-sm">
                            {scheme.applicationProcess.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No schemes selected for comparison</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Select at least one scheme to start comparing. You can compare up to three schemes side by side to find the best option for your needs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}