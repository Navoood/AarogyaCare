import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from '../../hooks/use-local-storage';
import { BookmarkedScheme, HealthScheme } from './types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  BookmarkPlus, 
  BookmarkCheck, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink, 
  Users, 
  CheckCircle2, 
  ClipboardList,
  CalendarClock
} from 'lucide-react';

interface SchemeDetailDialogProps {
  scheme: HealthScheme | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SchemeDetailDialog: React.FC<SchemeDetailDialogProps> = ({ 
  scheme, 
  isOpen, 
  onOpenChange 
}) => {
  const { language } = useLanguage();
  const [bookmarkedSchemes, setBookmarkedSchemes] = useLocalStorage<BookmarkedScheme[]>('bookmarked-schemes', []);
  
  // Early return if no scheme is provided
  if (!scheme) return null;
  
  const isBookmarked = bookmarkedSchemes.some(item => item.id === scheme.id);
  
  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarkedSchemes(bookmarkedSchemes.filter(item => item.id !== scheme.id));
    } else {
      const newBookmark: BookmarkedScheme = {
        id: scheme.id,
        dateBookmarked: new Date().toISOString()
      };
      setBookmarkedSchemes([...bookmarkedSchemes, newBookmark]);
    }
  };
  
  // Get localized content based on selected language
  const getLocalizedContent = () => {
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
  
  const localizedContent = getLocalizedContent();
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">{localizedContent.name}</DialogTitle>
              <DialogDescription className="mt-2 text-md leading-relaxed">
                {localizedContent.shortDescription}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBookmark}
              className="ml-2 flex-shrink-0"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <BookmarkPlus className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {scheme.category.map((cat) => (
              <Badge key={cat} variant="outline" className="bg-primary/10">
                {cat}
              </Badge>
            ))}
          </div>
        </DialogHeader>
        
        <div className="my-4">
          <img 
            src={scheme.imageUrl} 
            alt={scheme.name} 
            className="w-full h-40 object-contain rounded-md bg-muted/20 p-2" 
          />
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="application">How to Apply</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {scheme.eligibility.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {scheme.benefits.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{scheme.coverage}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="application" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Application Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-2">
                  {scheme.applicationProcess.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  Official Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(scheme.officialLinks).map(([key, url]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {url.replace(/^https?:\/\//, '')}
                    </a>
                    <Separator className="my-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Ways to get more information about this scheme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Website</div>
                    <a 
                      href={`https://${scheme.contactInformation.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {scheme.contactInformation.website}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Helpline</div>
                    <a 
                      href={`tel:${scheme.contactInformation.helpline}`}
                      className="text-primary hover:underline"
                    >
                      {scheme.contactInformation.helpline}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Email</div>
                    <a 
                      href={`mailto:${scheme.contactInformation.email}`}
                      className="text-primary hover:underline"
                    >
                      {scheme.contactInformation.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button 
            asChild
            className="gap-2"
          >
            <a 
              href={scheme.officialLinks.mainWebsite} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Visit Official Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchemeDetailDialog;