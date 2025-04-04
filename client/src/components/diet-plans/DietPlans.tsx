import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import dietPlansData from "@/data/diet_plans.json";

type DietPlan = {
  id: number;
  name: string;
  description: string;
  forConditions: string[];
  mealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  };
  recommendedFoods: string[];
  restrictedFoods: string[];
  mealTimingRecommendations: string;
};

export default function DietPlans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter diet plans based on search query
  const filteredPlans = dietPlansData.filter((plan: DietPlan) => {
    const query = searchQuery.toLowerCase();
    return (
      plan.name.toLowerCase().includes(query) ||
      plan.description.toLowerCase().includes(query) ||
      plan.forConditions.some(condition => condition.toLowerCase().includes(query))
    );
  });

  // Handle opening the diet plan detail dialog
  const handlePlanClick = (plan: DietPlan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search diet plans or health conditions..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Diet Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan: DietPlan) => (
          <Card 
            key={plan.id} 
            className="hover:shadow-md transition-shadow cursor-pointer" 
            onClick={() => handlePlanClick(plan)}
          >
            <CardHeader className="pb-2">
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {plan.forConditions.slice(0, 2).map((condition, index) => (
                  <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                    {condition}
                  </Badge>
                ))}
                {plan.forConditions.length > 2 && (
                  <Badge variant="outline" className="bg-muted hover:bg-muted/80">
                    +{plan.forConditions.length - 2} more
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                <span className="font-medium">Key focus:</span> {plan.recommendedFoods.slice(0, 2).join(", ")}...
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="secondary" size="sm" className="w-full">
                View Full Plan
              </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredPlans.length === 0 && (
          <div className="col-span-full py-10 text-center">
            <div className="text-muted-foreground">
              <p className="mb-2 text-lg">No diet plans match your search criteria</p>
              <p>Try searching for different health conditions or diet types</p>
            </div>
          </div>
        )}
      </div>

      {/* Diet Plan Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              {selectedPlan?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPlan?.forConditions.map((condition, index) => (
              <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700">
                {condition}
              </Badge>
            ))}
          </div>
          <ScrollArea className="flex-1 pr-4">
            <Tabs defaultValue="meal-plan" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
                <TabsTrigger value="foods">Recommended Foods</TabsTrigger>
                <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
                <TabsTrigger value="timing">Meal Timing</TabsTrigger>
              </TabsList>
              <TabsContent value="meal-plan" className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-primary-50 p-4 rounded-md">
                    <h3 className="font-semibold text-primary-900 mb-2">Breakfast</h3>
                    <p className="text-primary-700">{selectedPlan?.mealPlan.breakfast}</p>
                  </div>
                  <div className="bg-primary-50/70 p-4 rounded-md">
                    <h3 className="font-semibold text-primary-900 mb-2">Lunch</h3>
                    <p className="text-primary-700">{selectedPlan?.mealPlan.lunch}</p>
                  </div>
                  <div className="bg-primary-50/50 p-4 rounded-md">
                    <h3 className="font-semibold text-primary-900 mb-2">Dinner</h3>
                    <p className="text-primary-700">{selectedPlan?.mealPlan.dinner}</p>
                  </div>
                  <div className="bg-primary-50/30 p-4 rounded-md">
                    <h3 className="font-semibold text-primary-900 mb-2">Snacks</h3>
                    <ul className="list-disc list-inside text-primary-700">
                      {selectedPlan?.mealPlan.snacks.map((snack, index) => (
                        <li key={index}>{snack}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="foods" className="space-y-4">
                <h3 className="font-semibold">Recommended Foods</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPlan?.recommendedFoods.map((food, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm">{food}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="restrictions" className="space-y-4">
                <h3 className="font-semibold">Foods to Avoid or Limit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPlan?.restrictedFoods.map((food, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-sm">{food}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="timing" className="space-y-4">
                <h3 className="font-semibold">Meal Timing Recommendations</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground">{selectedPlan?.mealTimingRecommendations}</p>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-semibold mb-3">Additional Considerations</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm">Stay well hydrated throughout the day</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm">Portion control is essential even with healthy foods</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm">Individual responses to diets vary; consult with a healthcare provider</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
            <Button>Save This Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}