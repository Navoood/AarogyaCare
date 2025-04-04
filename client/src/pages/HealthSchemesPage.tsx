import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import HealthSchemes from "@/components/health-schemes/HealthSchemes";
import FeaturedSchemes from "@/components/health-schemes/FeaturedSchemes";
import SchemeComparison from "@/components/health-schemes/SchemeComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Bookmark, Info, Languages, LandmarkIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";

export default function HealthSchemesPage() {
  const { t, language, setLanguage } = useLanguage();
  const [view, setView] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  
  useEffect(() => {
    // Track page visit
    console.log("Health Schemes page visited");
  }, []);
  
  const handleLanguageChange = (lang: string) => {
    if (lang === "english" || lang === "hindi") {
      setLanguage(lang);
      toast({
        title: "Language Changed",
        description: lang === "english" ? "Language set to English" : "भाषा हिंदी में सेट की गई",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <LandmarkIcon className="mr-2 h-8 w-8 text-primary" />
              Government Health Schemes
            </h1>
            <p className="text-muted-foreground mt-2">
              Access comprehensive information about government health schemes and benefits available to you
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <ToggleGroup type="single" value={language} onValueChange={(value) => value && handleLanguageChange(value)}>
              <ToggleGroupItem value="english" aria-label="Toggle English">
                <Languages className="h-4 w-4 mr-2" />
                English
              </ToggleGroupItem>
              <ToggleGroupItem value="hindi" aria-label="Toggle Hindi">
                <Languages className="h-4 w-4 mr-2" />
                हिंदी
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        <Tabs defaultValue="all-schemes" className="space-y-6">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 h-auto">
            <TabsTrigger value="all-schemes" className="flex items-center justify-center py-2">
              <Search className="mr-2 h-4 w-4" />
              Browse All Schemes
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center justify-center py-2">
              <Info className="mr-2 h-4 w-4" />
              Featured Schemes
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center justify-center py-2">
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmarked Schemes
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center justify-center py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 16v-4a4 4 0 0 0-8 0v4"></path>
                <path d="M12 12v8"></path>
                <path d="M8 20h8"></path>
                <path d="M12 0v4"></path>
              </svg>
              Compare Schemes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-schemes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse All Government Health Schemes</CardTitle>
                <CardDescription>
                  Find comprehensive information about various health schemes offered by the government.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HealthSchemes viewMode={view} onViewModeChange={setView} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="featured" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Health Schemes</CardTitle>
                <CardDescription>
                  Highlighted government health schemes that may be relevant for you based on general demographics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeaturedSchemes />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookmarked" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookmarked Schemes</CardTitle>
                <CardDescription>
                  Health schemes you've saved for future reference. Bookmark schemes by clicking the bookmark icon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div id="bookmarked-schemes">
                  <HealthSchemes viewMode={view} onViewModeChange={setView} filterBookmarked={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compare Health Schemes</CardTitle>
                <CardDescription>
                  Select multiple schemes to compare benefits, eligibility criteria, and application processes side by side.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SchemeComparison />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-10 bg-muted rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Important Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">How to Apply for Health Schemes</h3>
              <p className="text-sm text-muted-foreground">
                Most schemes require you to apply through their official websites or at designated centers. 
                Each scheme has its own application process, which is detailed in its respective section.
                You may need identity documents such as Aadhaar, income certificates, or medical records depending on the scheme.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Need More Help?</h3>
              <p className="text-sm text-muted-foreground">
                If you need assistance understanding or applying for any of these schemes, 
                you can speak with a healthcare advisor or contact the scheme's helpline directly.
                Local Primary Health Centers (PHCs) often have facilitation desks to help with applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}