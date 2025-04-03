import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Apple, Coffee, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function DietPlans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch diet plans
  const { data: dietPlansData, isLoading } = useQuery({
    queryKey: ["/api/diet-plans", selectedCondition],
  });

  // Fetch conditions for filter
  const { data: conditionsData } = useQuery({
    queryKey: ["/api/conditions"],
  });

  // Filter diet plans based on search query
  const filteredDietPlans = dietPlansData?.dietPlans?.filter(
    (plan: any) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadPDF = (plan: any) => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "PDF Downloaded",
      description: `${plan.name} diet plan has been downloaded.`,
    });
  };

  const renderMealItem = (meal: any, icon: React.ReactNode) => (
    <div className="flex items-start space-x-3 mb-3">
      <div className="bg-primary-50 p-2 rounded-md">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium">{meal}</h4>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search diet plans..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCondition === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedCondition(null)}
          >
            All Plans
          </Button>
          {conditionsData?.conditions?.map((condition: any) => (
            <Button
              key={condition.id}
              variant={selectedCondition === condition.name ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedCondition(condition.name)}
            >
              {condition.name}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredDietPlans?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDietPlans.map((plan: any) => (
            <Card key={plan.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {plan.forConditions.map((condition: string) => (
                    <Badge key={condition} variant="outline">{condition}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="breakfast">
                  <div className="px-6 pt-2">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                      <TabsTrigger value="lunch">Lunch</TabsTrigger>
                      <TabsTrigger value="dinner">Dinner</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="p-6">
                    <TabsContent value="breakfast" className="mt-0">
                      {renderMealItem(plan.mealPlan.breakfast, <Coffee className="h-4 w-4 text-primary-600" />)}
                      {plan.mealPlan.snacks && plan.mealPlan.snacks.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Morning Snack</p>
                          {renderMealItem(plan.mealPlan.snacks[0], <Apple className="h-4 w-4 text-primary-600" />)}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="lunch" className="mt-0">
                      {renderMealItem(plan.mealPlan.lunch, <Utensils className="h-4 w-4 text-primary-600" />)}
                    </TabsContent>
                    <TabsContent value="dinner" className="mt-0">
                      {renderMealItem(plan.mealPlan.dinner, <Utensils className="h-4 w-4 text-primary-600" />)}
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t bg-gray-50">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDownloadPDF(plan)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as PDF
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border rounded-lg border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Utensils className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No diet plans found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery
              ? `No diet plans matching "${searchQuery}"`
              : selectedCondition
              ? `No diet plans for "${selectedCondition}"`
              : "No diet plans available"}
          </p>
        </div>
      )}
    </div>
  );
}
