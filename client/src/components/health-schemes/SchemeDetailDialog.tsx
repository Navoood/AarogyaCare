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

interface SchemeDetailDialogProps {
  scheme: HealthScheme;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function SchemeDetailDialog({ 
  scheme, 
  isOpen, 
  onClose, 
  isBookmarked, 
  onToggleBookmark 
}: SchemeDetailDialogProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scheme.languages[language]?.name || scheme.name,
        text: scheme.languages[language]?.shortDescription || scheme.shortDescription,
        url: scheme.officialLinks.mainWebsite,
      })
      .catch((error) => {
        console.error("Something went wrong with sharing", error);
        toast({
          title: "Sharing Failed",
          description: "Could not share this scheme. Try copying the link manually.",
          variant: "destructive",
        });
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(scheme.officialLinks.mainWebsite)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Official website link copied to clipboard!",
          });
        })
        .catch(() => {
          toast({
            title: "Copy Failed",
            description: "Could not copy the link. Try manually copying it from the provided URL.",
            variant: "destructive",
          });
        });
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // This function would typically generate a PDF with all details
  // For this demo, we'll just show a toast message
  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "A PDF with all details is being prepared for download.",
    });
    
    // In a real implementation, we would generate a PDF here
    setTimeout(() => {
      toast({
        title: "PDF Ready",
        description: "The scheme details have been downloaded successfully.",
      });
    }, 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-1">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {scheme.languages[language]?.name || scheme.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {scheme.languages[language]?.shortDescription || scheme.shortDescription}
              </DialogDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onToggleBookmark}
                className="text-muted-foreground hover:text-primary"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleShare}
                className="text-muted-foreground hover:text-primary"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handlePrint}
                className="text-muted-foreground hover:text-primary"
              >
                <Printer className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDownload}
                className="text-muted-foreground hover:text-primary"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-wrap gap-2 mb-4 px-1">
          {scheme.category.map((cat) => (
            <Badge key={cat} variant="outline" className="bg-primary-50 text-primary-700">
              {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Badge>
          ))}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Tabs 
            defaultValue="overview" 
            className="w-full h-full flex flex-col"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="justify-start rounded-none border-b h-auto px-1">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm py-2 rounded-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="eligibility" className="data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm py-2 rounded-none">
                Eligibility
              </TabsTrigger>
              <TabsTrigger value="benefits" className="data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm py-2 rounded-none">
                Benefits
              </TabsTrigger>
              <TabsTrigger value="application" className="data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm py-2 rounded-none">
                How to Apply
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm py-2 rounded-none">
                Contact Info
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1">
              <TabsContent value="overview" className="h-full mt-0 p-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-2/3 space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">About the Scheme</h3>
                      <p className="text-muted-foreground">
                        {scheme.languages[language]?.shortDescription || scheme.shortDescription}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Coverage</h3>
                      <div className="bg-primary-50 text-primary-700 p-4 rounded-md">
                        <span className="font-medium">{scheme.coverage}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Key Highlights</h3>
                      <ul className="space-y-2">
                        {scheme.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center mt-0.5">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="md:w-1/3">
                    <div className="sticky top-0">
                      <div className="aspect-video overflow-hidden rounded-md mb-4">
                        <img 
                          src={scheme.imageUrl} 
                          alt={scheme.languages[language]?.name || scheme.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://www.nhp.gov.in/NHPfiles/health_wellness.jpg";
                          }}
                        />
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-2">Quick Links</h4>
                        <ul className="space-y-2">
                          <li>
                            <a 
                              href={scheme.officialLinks.mainWebsite} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Official Website
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </li>
                          {Object.entries(scheme.officialLinks)
                            .filter(([key]) => key !== 'mainWebsite')
                            .map(([key, value]) => (
                              <li key={key}>
                                <a 
                                  href={value} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  {key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="eligibility" className="h-full mt-0 p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Eligibility Criteria</h3>
                    <div className="bg-muted/30 p-5 rounded-md">
                      <ul className="space-y-3">
                        {scheme.eligibility.map((criterion, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div>{criterion}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Who Can Apply?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scheme.category.includes("all-ages") && (
                        <div className="flex items-start gap-3 bg-green-50 p-4 rounded-md">
                          <User className="h-8 w-8 text-green-600" />
                          <div>
                            <h4 className="font-medium">All Ages</h4>
                            <p className="text-sm text-muted-foreground">This scheme is available for people of all age groups</p>
                          </div>
                        </div>
                      )}
                      
                      {scheme.category.includes("all-income") && (
                        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-md">
                          <User className="h-8 w-8 text-blue-600" />
                          <div>
                            <h4 className="font-medium">All Income Groups</h4>
                            <p className="text-sm text-muted-foreground">No income restrictions for this scheme</p>
                          </div>
                        </div>
                      )}
                      
                      {scheme.category.includes("low-income") && (
                        <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-md">
                          <User className="h-8 w-8 text-amber-600" />
                          <div>
                            <h4 className="font-medium">Low Income Groups</h4>
                            <p className="text-sm text-muted-foreground">Primarily for economically weaker sections</p>
                          </div>
                        </div>
                      )}
                      
                      {scheme.category.includes("women") && (
                        <div className="flex items-start gap-3 bg-purple-50 p-4 rounded-md">
                          <User className="h-8 w-8 text-purple-600" />
                          <div>
                            <h4 className="font-medium">Women</h4>
                            <p className="text-sm text-muted-foreground">Specifically designed for women's health needs</p>
                          </div>
                        </div>
                      )}
                      
                      {scheme.category.includes("children") && (
                        <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-md">
                          <User className="h-8 w-8 text-indigo-600" />
                          <div>
                            <h4 className="font-medium">Children</h4>
                            <p className="text-sm text-muted-foreground">Focused on children's health and wellness</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="benefits" className="h-full mt-0 p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Benefits & Coverage</h3>
                    <ul className="space-y-4">
                      {scheme.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4" />
                          </div>
                          <div className="pt-1">{benefit}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Coverage Amount</h3>
                    <div className="bg-green-50 p-6 rounded-md text-center">
                      <h2 className="text-2xl font-bold text-green-700 mb-2">{scheme.coverage}</h2>
                      <p className="text-green-600">Maximum coverage under this scheme</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="application" className="h-full mt-0 p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Application Process</h3>
                    <div className="relative pl-8 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-muted-foreground/30">
                      {scheme.applicationProcess.map((step, index) => (
                        <div key={index} className="relative mb-8 last:mb-0">
                          <div className="absolute left-[-30px] h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            {index + 1}
                          </div>
                          <div className="bg-muted/20 p-4 rounded-md">
                            <p>{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Required Documents</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Identity Proof (Aadhaar Card/Voter ID/PAN Card)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Address Proof</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Income Certificate (if applicable)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Bank Account Details</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Passport-sized Photographs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Medical Records (if applicable)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="h-full mt-0 p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-5 rounded-md flex flex-col items-center text-center">
                        <Globe className="h-12 w-12 text-blue-600 mb-3" />
                        <h4 className="font-medium mb-1">Website</h4>
                        <a 
                          href={scheme.contactInformation.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          Visit Official Website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                      
                      <div className="bg-green-50 p-5 rounded-md flex flex-col items-center text-center">
                        <Phone className="h-12 w-12 text-green-600 mb-3" />
                        <h4 className="font-medium mb-1">Helpline</h4>
                        <a 
                          href={`tel:${scheme.contactInformation.helpline.replace(/\s/g, '')}`}
                          className="text-primary hover:underline"
                        >
                          {scheme.contactInformation.helpline}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          Toll-free number for inquiries
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-5 rounded-md flex flex-col items-center text-center">
                        <Mail className="h-12 w-12 text-purple-600 mb-3" />
                        <h4 className="font-medium mb-1">Email</h4>
                        <a 
                          href={`mailto:${scheme.contactInformation.email}`}
                          className="text-primary hover:underline"
                        >
                          {scheme.contactInformation.email}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          For detailed inquiries
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Official Resources</h3>
                    <div className="bg-muted/20 p-4 rounded-md">
                      <ul className="space-y-3 divide-y">
                        {Object.entries(scheme.officialLinks).map(([key, value]) => (
                          <li key={key} className="pt-3 first:pt-0">
                            <a 
                              href={value} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center justify-between"
                            >
                              <span className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                {key === 'mainWebsite' ? 'Main Website' : key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
                              </span>
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button 
            variant="default"
            onClick={() => {
              window.open(scheme.officialLinks.mainWebsite, '_blank');
            }}
          >
            Visit Official Website
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}