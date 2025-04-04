import Layout from "@/components/layout/Layout";
import DietPlans from "@/components/diet-plans/DietPlans";
import SmartDietRecommendation from "@/components/diet-plans/SmartDietRecommendation";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Brain, Utensils } from "lucide-react";

export default function DietPlansPage() {
  const { t } = useLanguage();

  return (
    <Layout title={t("dietPlans")}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Smart Diet Plans</h1>
          <p className="text-gray-600">
            Get personalized diet recommendations based on your health conditions and dietary preferences.
            Our smart system uses advanced algorithms to match your needs with the most suitable diet plans.
          </p>
        </div>
        
        <Tabs defaultValue="personalized" className="mb-6">
          <TabsList>
            <TabsTrigger value="personalized">Personalized Recommendations</TabsTrigger>
            <TabsTrigger value="all-plans">All Diet Plans</TabsTrigger>
            <TabsTrigger value="condition-specific">By Health Condition</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personalized">
            <SmartDietRecommendation />
          </TabsContent>
          
          <TabsContent value="all-plans">
            <DietPlans />
          </TabsContent>
          
          <TabsContent value="condition-specific">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-md">
                      <Brain className="h-5 w-5" />
                    </div>
                    <CardTitle>Diabetes Management</CardTitle>
                  </div>
                  <CardDescription>Low glycemic index foods with balanced carbohydrates</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Plans focused on stable blood sugar, regular meal timing, and portion control.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="bg-red-50 text-red-600 p-2 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <CardTitle>Heart Health</CardTitle>
                  </div>
                  <CardDescription>Low sodium, heart-healthy options</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Diet plans emphasizing foods that lower cholesterol and reduce blood pressure.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-50 text-green-600 p-2 rounded-md">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <CardTitle>Digestive Health</CardTitle>
                  </div>
                  <CardDescription>High fiber, gut-friendly foods</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Focus on prebiotic, probiotic, and easily digestible foods for optimal gut health.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="bg-amber-50 text-amber-600 p-2 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <CardTitle>Weight Management</CardTitle>
                  </div>
                  <CardDescription>Balanced calorie-controlled plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Sustainable approaches to healthy weight through nutritionally dense foods.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="bg-purple-50 text-purple-600 p-2 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <CardTitle>Bone Health</CardTitle>
                  </div>
                  <CardDescription>Calcium and vitamin D rich foods</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Diets to strengthen bones and prevent osteoporosis through essential nutrients.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-md">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <CardTitle>Traditional Indian</CardTitle>
                  </div>
                  <CardDescription>Ayurvedic principles for balanced health</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Time-tested traditional diet recommendations based on Ayurvedic principles.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <DietPlans />
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="font-medium mb-3">Nutritional Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Healthy Cooking Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Learn about steaming, grilling, baking, and other healthy cooking techniques
                  that preserve nutrients while minimizing added fats.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Local Nutritious Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Discover locally available, affordable ingredients that pack a nutritional punch
                  and can be incorporated into your daily meals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
