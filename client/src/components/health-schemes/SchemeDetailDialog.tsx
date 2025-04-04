import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Phone, 
  Mail, 
  Globe, 
  Share2, 
  Printer, 
  Download,
  Check,
  FileText,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { HealthScheme } from "./types";

interface SchemeDetailDialogProps {
  scheme: HealthScheme | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SchemeDetailDialog({ scheme, isOpen, onClose }: SchemeDetailDialogProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Use local storage for bookmarks
  const [bookmarkedSchemes, setBookmarkedSchemes] = useLocalStorage<string[]>("bookmarked-health-schemes", []);
  
  if (!scheme) return null;
  
  const isBookmarked = bookmarkedSchemes.includes(scheme.id);
  
  // Toggle bookmark status for a scheme
  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarkedSchemes(bookmarkedSchemes.filter(id => id !== scheme.id));
      toast({
        title: "Bookmark Removed",
        description: "The scheme has been removed from your bookmarks.",
      });
    } else {
      setBookmarkedSchemes([...bookmarkedSchemes, scheme.id]);
      toast({
        title: "Scheme Bookmarked",
        description: "The scheme has been added to your bookmarks for easy access.",
      });
    }
  };
  
  // Helper function to get translated name
  const getLocalizedName = () => {
    if (language !== "english" && scheme.languages[language]?.name) {
      return scheme.languages[language].name;
    }
    return scheme.name;
  };
  
  // Helper function to get translated description
  const getLocalizedDescription = () => {
    if (language !== "english" && scheme.languages[language]?.shortDescription) {
      return scheme.languages[language].shortDescription;
    }
    return scheme.shortDescription;
  };
  
  // Handle print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = `
        <html>
          <head>
            <title>${getLocalizedName()} - Details</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { color: #1d4ed8; }
              h2 { color: #2563eb; margin-top: 20px; }
              .section { margin-bottom: 20px; }
              ul { padding-left: 20px; }
              .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h1>${getLocalizedName()}</h1>
            <p>${getLocalizedDescription()}</p>
            
            <div class="section">
              <h2>Coverage</h2>
              <p>${scheme.coverage}</p>
            </div>
            
            <div class="section">
              <h2>Eligibility</h2>
              <ul>
                ${scheme.eligibility.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <div class="section">
              <h2>Benefits</h2>
              <ul>
                ${scheme.benefits.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <div class="section">
              <h2>Application Process</h2>
              <ol>
                ${scheme.applicationProcess.map(item => `<li>${item}</li>`).join('')}
              </ol>
            </div>
            
            <div class="section">
              <h2>Contact Information</h2>
              <p>Website: ${scheme.contactInformation.website}</p>
              <p>Helpline: ${scheme.contactInformation.helpline}</p>
              <p>Email: ${scheme.contactInformation.email}</p>
            </div>
            
            <div class="footer">
              <p>Printed from AAROGYA Health Platform on ${new Date().toLocaleDateString()}</p>
              <p>For the most up-to-date information, please visit the official website: ${scheme.officialLinks.mainWebsite}</p>
            </div>
          </body>
        </html>
      `;
      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl md:text-2xl">{getLocalizedName()}</DialogTitle>
              <DialogDescription className="mt-1.5">
                {getLocalizedDescription()}
              </DialogDescription>
            </div>
            <div>
              <Button variant="ghost" size="icon" onClick={toggleBookmark} aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
                {isBookmarked ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {scheme.category.map((cat) => (
              <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Badge>
            ))}
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="application">Apply</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 pr-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div>
                <img 
                  src={scheme.imageUrl} 
                  alt={scheme.name} 
                  className="rounded-md w-full h-48 object-cover mb-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://www.nhp.gov.in/NHPfiles/health_wellness.jpg"; // Fallback image
                  }}
                />
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Coverage</h4>
                  <p className="text-sm">{scheme.coverage}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Key Benefits</h4>
                  <ul className="text-sm space-y-1">
                    {scheme.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="eligibility" className="mt-0 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Eligibility Criteria</h4>
                <ul className="text-sm space-y-2">
                  {scheme.eligibility.map((criterion, index) => (
                    <li key={index} className="flex items-start">
                      <User className="h-4 w-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Official Verification Links</h4>
                {scheme.officialLinks.eligibilityCheck ? (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={scheme.officialLinks.eligibilityCheck} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Check Eligibility Online
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Please visit the official website or contact the helpline to verify your eligibility.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="application" className="mt-0 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Application Process</h4>
                <ol className="text-sm space-y-2">
                  {scheme.applicationProcess.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {scheme.officialLinks.mainWebsite && (
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <a href={scheme.officialLinks.mainWebsite} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-3.5 w-3.5 mr-2" />
                      Official Website
                    </a>
                  </Button>
                )}
                
                {scheme.officialLinks.hospitalList && (
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <a href={scheme.officialLinks.hospitalList} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3.5 w-3.5 mr-2" />
                      Empanelled Hospitals
                    </a>
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Helpline
                  </h4>
                  <p className="text-sm">{scheme.contactInformation.helpline}</p>
                </div>
                
                <div className="bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </h4>
                  <p className="text-sm">{scheme.contactInformation.email}</p>
                </div>
                
                <div className="bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </h4>
                  <a 
                    href={scheme.contactInformation.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {scheme.contactInformation.website}
                  </a>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Additional Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(scheme.officialLinks)
                    .filter(([key]) => key !== 'mainWebsite' && key !== 'eligibilityCheck' && key !== 'hospitalList')
                    .map(([key, url]) => (
                      <Button key={key} variant="outline" size="sm" className="justify-start" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-2" />
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </a>
                      </Button>
                    ))}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <div className="flex justify-between mt-4 pt-2 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-2" />
              Print Details
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-3.5 w-3.5 mr-2" />
              Share
            </Button>
          </div>
          <DialogClose asChild>
            <Button variant="secondary" size="sm">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}