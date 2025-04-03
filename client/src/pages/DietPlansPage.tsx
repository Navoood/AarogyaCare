import Layout from "@/components/layout/Layout";
import DietPlans from "@/components/diet-plans/DietPlans";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function DietPlansPage() {
  const { t } = useLanguage();

  return (
    <Layout title={t("dietPlans")}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Diet Plans</h1>
          <p className="text-gray-600">
            Explore diet plans tailored to different health conditions and nutritional needs.
            A balanced diet is essential for maintaining good health and managing various conditions.
          </p>
        </div>
        
        <Tabs defaultValue="all-plans" className="mb-6">
          <TabsList>
            <TabsTrigger value="all-plans">All Diet Plans</TabsTrigger>
            <TabsTrigger value="recommended">Recommended For You</TabsTrigger>
            <TabsTrigger value="condition-specific">Condition Specific</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-plans">
            <DietPlans />
          </TabsContent>
          
          <TabsContent value="recommended">
            <div className="mb-6">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Personalized Diet Recommendations</CardTitle>
                  <CardDescription>
                    Based on your health profile and recent check-ups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary-100 text-primary-600 p-2 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Include more fiber in your diet</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Aim for 25-30g of fiber daily from sources like whole grains, 
                          fruits, vegetables, and legumes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary-100 text-primary-600 p-2 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Reduce sodium intake</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Limit processed foods and added salt to help manage your blood pressure.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary-100 text-primary-600 p-2 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Stay hydrated</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Drink at least 8 glasses of water daily, especially before meals.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <DietPlans />
            </div>
          </TabsContent>
          
          <TabsContent value="condition-specific">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Diabetes Management</CardTitle>
                  <CardDescription>Low glycemic index foods</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="text-sm text-primary-600">View diet plans →</p>
                </CardFooter>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Heart Health</CardTitle>
                  <CardDescription>Low sodium, heart-healthy options</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="text-sm text-primary-600">View diet plans →</p>
                </CardFooter>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Digestive Health</CardTitle>
                  <CardDescription>High fiber, gut-friendly foods</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="text-sm text-primary-600">View diet plans →</p>
                </CardFooter>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Weight Management</CardTitle>
                  <CardDescription>Balanced calorie-controlled plans</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="text-sm text-primary-600">View diet plans →</p>
                </CardFooter>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Bone Health</CardTitle>
                  <CardDescription>Calcium and vitamin D rich foods</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="text-sm text-primary-600">View diet plans →</p>
                </CardFooter>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Immune Support</CardTitle>
                  <CardDescription>Nutrient-dense immunity boosting foods</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="text-sm text-primary-600">View diet plans →</p>
                </CardFooter>
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
