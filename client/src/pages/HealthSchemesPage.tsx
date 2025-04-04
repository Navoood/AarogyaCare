import { useState } from "react";
import { useLanguage, languageLabels } from "@/context/LanguageContext";
import Layout from "@/components/layout/Layout";
import HealthSchemes from "@/components/health-schemes/HealthSchemes";
import FeaturedSchemes from "@/components/health-schemes/FeaturedSchemes";
import SchemeComparison from "@/components/health-schemes/SchemeComparison";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, DownloadCloud, Globe, Languages, Lightbulb, SlidersHorizontal } from "lucide-react";

export default function HealthSchemesPage() {
  const { language, setLanguage } = useLanguage();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all-schemes");
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Government Health Schemes</h1>
            <p className="text-muted-foreground mt-1">
              Discover and compare government health schemes available in your region
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={language} onValueChange={(val) => setLanguage(val as any)}>
              <SelectTrigger className="w-[150px]">
                <Languages className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languageLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center">
                      <span>{label.nativeName}</span>
                      <span className="ml-1 text-muted-foreground">({label.name})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <DownloadCloud className="h-4 w-4" />
              <span className="hidden sm:inline">Download Guides</span>
            </Button>
          </div>
        </div>
        
        <Tabs
          defaultValue="all-schemes"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all-schemes">All Schemes</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
              <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all-schemes">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle>Available Health Schemes</CardTitle>
                      <CardDescription>
                        Browse through all government health schemes
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="hidden md:flex gap-1.5">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Advanced Filters
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <HealthSchemes 
                    viewMode={viewMode} 
                    onViewModeChange={setViewMode} 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="featured">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <span>Featured Health Schemes</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  Highlighted schemes with recent updates and maximum benefits for rural communities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <FeaturedSchemes />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compare">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Compare Health Schemes</CardTitle>
                <CardDescription>
                  Compare different schemes side by side to find what best suits your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <SchemeComparison />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookmarked">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-primary" />
                    <span>Bookmarked Schemes</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  Quick access to your saved health schemes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <HealthSchemes 
                  viewMode={viewMode} 
                  onViewModeChange={setViewMode} 
                  filterBookmarked={true} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="bg-muted/40 border-dashed mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Regional Health Programs
            </CardTitle>
            <CardDescription>
              In addition to national schemes, several state-specific health programs are available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Local health programs can offer additional benefits specific to your region. Contact your local health center or visit the state health department website for more information.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
              {["Andhra Pradesh", "Karnataka", "Tamil Nadu", "Kerala", "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh"].map((state) => (
                <Button key={state} variant="outline" className="text-xs h-8 bg-background">
                  {state} Health Programs
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}