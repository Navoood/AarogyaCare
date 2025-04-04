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
import { HealthScheme } from "./types";

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
  
  // Prepare the comparison data for PDF/print export
  const downloadComparisonAsPdf = () => {
    if (selectedSchemes.length === 0) {
      toast({
        title: "No Schemes Selected",
        description: "Please add at least one scheme to generate a comparison report.",
        variant: "destructive",
      });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = `
      <html>
        <head>
          <title>Health Schemes Comparison</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #1d4ed8; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #e0e7ff; padding: 10px; text-align: left; border: 1px solid #d1d5db; }
            td { padding: 10px; border: 1px solid #d1d5db; vertical-align: top; }
            .scheme-name { font-weight: bold; font-size: 18px; }
            .category { display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 12px; margin: 2px; font-size: 12px; }
            .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Health Schemes Comparison</h1>
          
          <table>
            <tr>
              <th style="width: 180px;">Criteria</th>
              ${selectedSchemes.map(scheme => `
                <th class="scheme-name">${getLocalizedName(scheme)}</th>
              `).join('')}
            </tr>
            
            <tr>
              <td><strong>Description</strong></td>
              ${selectedSchemes.map(scheme => `
                <td>${getLocalizedDescription(scheme)}</td>
              `).join('')}
            </tr>
            
            <tr>
              <td><strong>Categories</strong></td>
              ${selectedSchemes.map(scheme => `
                <td>
                  ${scheme.category.map(cat => `
                    <span class="category">${cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                  `).join('')}
                </td>
              `).join('')}
            </tr>
            
            <tr>
              <td><strong>Coverage</strong></td>
              ${selectedSchemes.map(scheme => `
                <td>${scheme.coverage}</td>
              `).join('')}
            </tr>
            
            <tr>
              <td><strong>Eligibility</strong></td>
              ${selectedSchemes.map(scheme => `
                <td>
                  <ul>
                    ${scheme.eligibility.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            
            <tr>
              <td><strong>Benefits</strong></td>
              ${selectedSchemes.map(scheme => `
                <td>
                  <ul>
                    ${scheme.benefits.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            
            <tr>
              <td><strong>Application Process</strong></td>
              ${selectedSchemes.map(scheme => `
                <td>
                  <ol>
                    ${scheme.applicationProcess.map(item => `<li>${item}</li>`).join('')}
                  </ol>
                </td>
              `).join('')}
            </tr>
            
            <tr>
              <td><strong>Contact Information</strong></td>
              ${selectedSchemes.map(scheme => `
                <td>
                  <p>Helpline: ${scheme.contactInformation.helpline}</p>
                  <p>Email: ${scheme.contactInformation.email}</p>
                  <p>Website: ${scheme.contactInformation.website}</p>
                </td>
              `).join('')}
            </tr>
          </table>
          
          <div class="footer">
            <p>Comparison generated from AAROGYA Health Platform on ${new Date().toLocaleDateString()}</p>
            <p>For the most up-to-date information, please visit the official websites of each scheme.</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Scheme Selector */}
        <div className="flex-1 flex flex-col md:flex-row gap-2">
          <Select value={selectedSchemeId} onValueChange={setSelectedSchemeId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a scheme to compare" />
            </SelectTrigger>
            <SelectContent>
              {schemes.map((scheme) => (
                <SelectItem key={scheme.id} value={scheme.id}>
                  {getLocalizedName(scheme)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={addSchemeToComparison} 
            disabled={!selectedSchemeId || selectedSchemes.length >= 3}
            className="shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Comparison
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={downloadComparisonAsPdf} 
            disabled={selectedSchemes.length === 0}
            className="shrink-0"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Comparison
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => setSelectedSchemes([])} 
            disabled={selectedSchemes.length === 0}
            className="shrink-0"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>
      
      {selectedSchemes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ArrowLeftRight className="mr-2 h-5 w-5 text-primary" />
              Comparing {selectedSchemes.length} Health {selectedSchemes.length === 1 ? 'Scheme' : 'Schemes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[1000px]">
                {/* Schemes Header */}
                <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(250px,1fr))] gap-4 mb-4">
                  <div className="font-medium text-center">Criteria</div>
                  {selectedSchemes.map((scheme) => (
                    <div key={scheme.id} className="relative pb-8">
                      <div className="font-medium text-lg text-center mb-1 text-primary">
                        {getLocalizedName(scheme)}
                      </div>
                      <div className="text-sm text-center text-muted-foreground mb-2 line-clamp-2">
                        {getLocalizedDescription(scheme)}
                      </div>
                      <div className="flex flex-wrap justify-center gap-1 mb-2">
                        {scheme.category.map((cat) => (
                          <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700">
                            {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSchemeFromComparison(scheme.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Separator className="mb-4" />
                
                {/* Coverage Comparison */}
                <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(250px,1fr))] gap-4 mb-4">
                  <div className="font-medium">Coverage</div>
                  {selectedSchemes.map((scheme) => (
                    <div key={`coverage-${scheme.id}`} className="text-sm">
                      {scheme.coverage}
                    </div>
                  ))}
                </div>
                
                <Separator className="mb-4" />
                
                {/* Eligibility Comparison */}
                <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(250px,1fr))] gap-4 mb-4">
                  <div className="font-medium">Eligibility</div>
                  {selectedSchemes.map((scheme) => (
                    <div key={`eligibility-${scheme.id}`}>
                      <ul className="text-sm space-y-2 list-disc pl-5">
                        {scheme.eligibility.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <Separator className="mb-4" />
                
                {/* Benefits Comparison */}
                <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(250px,1fr))] gap-4 mb-4">
                  <div className="font-medium">Benefits</div>
                  {selectedSchemes.map((scheme) => (
                    <div key={`benefits-${scheme.id}`}>
                      <ul className="text-sm space-y-2 list-disc pl-5">
                        {scheme.benefits.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <Separator className="mb-4" />
                
                {/* Application Process Comparison */}
                <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(250px,1fr))] gap-4 mb-4">
                  <div className="font-medium">Application Process</div>
                  {selectedSchemes.map((scheme) => (
                    <div key={`process-${scheme.id}`}>
                      <ol className="text-sm space-y-2 list-decimal pl-5">
                        {scheme.applicationProcess.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
                
                <Separator className="mb-4" />
                
                {/* Contact Information Comparison */}
                <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(250px,1fr))] gap-4">
                  <div className="font-medium">Contact Information</div>
                  {selectedSchemes.map((scheme) => (
                    <div key={`contact-${scheme.id}`} className="text-sm space-y-2">
                      <div>
                        <span className="font-medium">Helpline:</span> {scheme.contactInformation.helpline}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {scheme.contactInformation.email}
                      </div>
                      <div>
                        <span className="font-medium">Website:</span>{" "}
                        <a
                          href={scheme.contactInformation.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit Official Website
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No schemes selected for comparison</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Select up to three health schemes to compare their benefits, eligibility criteria, and application processes side by side.
          </p>
          <Button variant="outline" disabled={schemes.length === 0} onClick={() => {
            if (schemes.length > 0) {
              // Add first scheme automatically for demonstration
              setSelectedSchemes([schemes[0]]);
              toast({
                title: "First Scheme Added",
                description: "The first scheme has been added to your comparison for demonstration.",
              });
            }
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Scheme
          </Button>
        </div>
      )}
    </div>
  );
}