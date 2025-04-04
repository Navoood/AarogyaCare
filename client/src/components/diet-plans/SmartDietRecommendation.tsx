import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import dietPlansData from "@/data/diet_plans.json";

interface HealthCondition {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
}

const healthConditions: HealthCondition[] = [
  { id: "diabetes", name: "Diabetes", description: "Type 1 or Type 2 diabetes", weight: 10 },
  { id: "hypertension", name: "Hypertension", description: "High blood pressure", weight: 9 },
  { id: "heart_disease", name: "Heart Disease", description: "Cardiovascular conditions", weight: 9 },
  { id: "obesity", name: "Obesity", description: "BMI over 30", weight: 8 },
  { id: "digestive", name: "Digestive Issues", description: "IBS, GERD, or other digestive disorders", weight: 7 },
  { id: "arthritis", name: "Arthritis", description: "Joint inflammation or pain", weight: 6 },
  { id: "kidney", name: "Kidney Issues", description: "Kidney disease or stones", weight: 8 },
  { id: "bone_health", name: "Bone Health Concerns", description: "Osteoporosis or osteopenia", weight: 6 },
  { id: "gluten", name: "Gluten Sensitivity", description: "Celiac disease or gluten intolerance", weight: 7 },
];

const dietaryPreferences: DietaryPreference[] = [
  { id: "vegetarian", name: "Vegetarian", description: "No meat consumption", impact: "neutral", weight: 5 },
  { id: "low_carb", name: "Low Carbohydrate", description: "Reduced carbohydrate intake", impact: "positive", weight: 6 },
  { id: "low_fat", name: "Low Fat", description: "Reduced fat consumption", impact: "positive", weight: 4 },
  { id: "low_sodium", name: "Low Sodium", description: "Reduced salt intake", impact: "positive", weight: 7 },
  { id: "high_protein", name: "High Protein", description: "Increased protein consumption", impact: "neutral", weight: 5 },
  { id: "dairy_free", name: "Dairy Free", description: "No dairy products", impact: "neutral", weight: 4 },
  { id: "traditional", name: "Traditional Indian", description: "Ayurvedic principles", impact: "positive", weight: 6 },
];

// Mapping health conditions to diet plans
const conditionToDietMapping: Record<string, string[]> = {
  "diabetes": ["Diabetic Diet", "Low FODMAP Diet", "Weight Management Diet"],
  "hypertension": ["Heart-Healthy Diet", "Low FODMAP Diet", "Renal-Friendly Diet"],
  "heart_disease": ["Heart-Healthy Diet", "Anti-Inflammatory Diet", "Weight Management Diet"],
  "obesity": ["Weight Management Diet", "Heart-Healthy Diet", "Diabetic Diet"],
  "digestive": ["Digestive Health Diet", "Low FODMAP Diet", "Gluten-Free Diet"],
  "arthritis": ["Anti-Inflammatory Diet", "Weight Management Diet", "Bone Health Diet"],
  "kidney": ["Renal-Friendly Diet", "Heart-Healthy Diet", "Low FODMAP Diet"],
  "bone_health": ["Bone Health Diet", "Anti-Inflammatory Diet", "Weight Management Diet"],
  "gluten": ["Gluten-Free Diet", "Low FODMAP Diet", "Anti-Inflammatory Diet"],
};

export default function SmartDietRecommendation() {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [processingStep, setProcessingStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendedPlans, setRecommendedPlans] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const { toast } = useToast();

  // Handle health condition selection
  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId) 
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  // Handle dietary preference selection
  const togglePreference = (preferenceId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceId) 
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  // Generate diet plan recommendations based on selected conditions and preferences
  const generateRecommendations = () => {
    if (selectedConditions.length === 0) {
      toast({
        title: "Health Conditions Required",
        description: "Please select at least one health condition to generate recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate processing time for AI-like experience
    const processingInterval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev >= 100) {
          clearInterval(processingInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    // Perform analysis logic
    setTimeout(() => {
      // This is our "AI-like" recommendation engine that works without an API
      const planScores = new Map<string, number>();
      
      // Score each diet plan based on selected health conditions
      selectedConditions.forEach(conditionId => {
        const condition = healthConditions.find(c => c.id === conditionId);
        const conditionWeight = condition?.weight || 5;
        
        const recommendedDiets = conditionToDietMapping[conditionId] || [];
        recommendedDiets.forEach(dietName => {
          const currentScore = planScores.get(dietName) || 0;
          planScores.set(dietName, currentScore + conditionWeight);
        });
      });
      
      // Adjust scores based on dietary preferences
      selectedPreferences.forEach(prefId => {
        const preference = dietaryPreferences.find(p => p.id === prefId);
        if (!preference) return;
        
        // Apply preference influence to all diet plans
        dietPlansData.forEach(plan => {
          let score = planScores.get(plan.name) || 0;
          
          // For example, if someone prefers low sodium and the plan is heart-healthy
          if (prefId === "low_sodium" && plan.name === "Heart-Healthy Diet") {
            score += preference.weight;
          } 
          // Low carb preference boosts diabetic diet score
          else if (prefId === "low_carb" && plan.name === "Diabetic Diet") {
            score += preference.weight;
          }
          // Vegetarian preference affects some plans
          else if (prefId === "vegetarian" && 
                  ["Anti-Inflammatory Diet", "Traditional Indian Ayurvedic Diet"].includes(plan.name)) {
            score += preference.weight;
          }
          
          planScores.set(plan.name, score);
        });
      });
      
      // Convert scores to sorted array
      const sortedPlans = Array.from(planScores.entries())
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      // Match with full plan details
      const recommendedPlansWithDetails = sortedPlans.map(([planName, score]) => {
        const planDetails = dietPlansData.find(plan => plan.name === planName);
        return {
          ...planDetails,
          matchScore: score,
          matchPercentage: Math.min(100, Math.round((score / 20) * 100)) // Normalize to percentage
        };
      }).filter(plan => plan !== undefined);

      // Generate analysis text
      let analysisText = "Based on your health profile, ";
      
      if (selectedConditions.length > 0) {
        const conditionNames = selectedConditions.map(id => 
          healthConditions.find(c => c.id === id)?.name || id
        ).join(", ");
        
        analysisText += `considering your health conditions (${conditionNames}), `;
      }
      
      if (selectedPreferences.length > 0) {
        const preferenceNames = selectedPreferences.map(id => 
          dietaryPreferences.find(p => p.id === id)?.name || id
        ).join(", ");
        
        analysisText += `and your dietary preferences (${preferenceNames}), `;
      }
      
      analysisText += "I've analyzed the optimal nutritional patterns for your needs. ";
      
      if (recommendedPlansWithDetails.length > 0) {
        analysisText += `The ${recommendedPlansWithDetails[0].name} appears most suitable, with a ${recommendedPlansWithDetails[0].matchPercentage}% match to your specific requirements.`;
      } else {
        analysisText += "I recommend consulting with a healthcare provider for personalized nutrition advice.";
      }

      setAnalysisResult(analysisText);
      setRecommendedPlans(recommendedPlansWithDetails);
      
      clearInterval(processingInterval);
      setProcessingStep(100);
      
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }, 1500);
  };

  // Reset selections and recommendations
  const resetSelections = () => {
    setSelectedConditions([]);
    setSelectedPreferences([]);
    setRecommendedPlans([]);
    setAnalysisResult("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Smart Diet Recommendation System</CardTitle>
          <CardDescription>
            Our smart system analyzes your health conditions and dietary preferences to recommend personalized diet plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Health Conditions Selection */}
            <div>
              <h3 className="text-lg font-medium mb-4">Select Your Health Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {healthConditions.map((condition) => (
                  <div 
                    key={condition.id}
                    className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox 
                      id={`condition-${condition.id}`} 
                      checked={selectedConditions.includes(condition.id)}
                      onCheckedChange={() => toggleCondition(condition.id)}
                    />
                    <div className="grid gap-1.5">
                      <Label 
                        htmlFor={`condition-${condition.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {condition.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {condition.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Dietary Preferences Selection */}
            <div>
              <h3 className="text-lg font-medium mb-4">Select Your Dietary Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dietaryPreferences.map((preference) => (
                  <div 
                    key={preference.id}
                    className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox 
                      id={`preference-${preference.id}`} 
                      checked={selectedPreferences.includes(preference.id)}
                      onCheckedChange={() => togglePreference(preference.id)}
                    />
                    <div className="grid gap-1.5">
                      <Label 
                        htmlFor={`preference-${preference.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {preference.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {preference.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Medical Disclaimer</h4>
                <p className="text-sm text-amber-700 mt-1">
                  The diet recommendations are generated based on general guidelines and should not replace professional medical advice. 
                  Always consult with a healthcare provider before making significant dietary changes, especially for managing health conditions.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                className="flex-1" 
                onClick={generateRecommendations}
                disabled={isProcessing || selectedConditions.length === 0}
              >
                Generate Recommendations
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={resetSelections}
                disabled={isProcessing}
              >
                Reset Selections
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Your Health Profile</CardTitle>
            <CardDescription>
              Our system is analyzing your health conditions and dietary preferences to generate personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={processingStep} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className={`p-2 rounded ${processingStep >= 30 ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                Analyzing health conditions...
              </div>
              <div className={`p-2 rounded ${processingStep >= 60 ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                Matching dietary patterns...
              </div>
              <div className={`p-2 rounded ${processingStep >= 90 ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                Generating recommendations...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Results */}
      {!isProcessing && recommendedPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Diet Recommendations</CardTitle>
            <CardDescription>
              {analysisResult}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recommendedPlans.map((plan, index) => (
                <Card key={plan.id} className={`overflow-hidden border-t-4 ${
                  index === 0 ? 'border-t-primary-600' : 
                  index === 1 ? 'border-t-primary-400' : 'border-t-primary-300'
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription className="mt-1">{plan.description}</CardDescription>
                      </div>
                      <div className="bg-primary-50 text-primary-700 font-medium text-sm px-2 py-1 rounded-md">
                        {plan.matchPercentage}% Match
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <ScrollArea className="h-32 rounded-md border p-2">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Recommended Foods:</h4>
                        <ul className="text-sm space-y-1">
                          {plan.recommendedFoods?.map((food: string, i: number) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="text-primary-600 text-xs mt-0.5">•</span>
                              <span>{food}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 mt-2">
                    <Button 
                      variant="outline" 
                      className="text-xs" 
                      size="sm"
                      onClick={() => {
                        // Scroll to the DietPlans component section
                        document.getElementById('all-diet-plans')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      View Meal Plan
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="text-xs" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Plan Saved",
                          description: `${plan.name} has been saved to your profile`,
                        });
                      }}
                    >
                      Save This Plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* All Diet Plans Section */}
      <div id="all-diet-plans" className="pt-4">
        {!isProcessing && recommendedPlans.length > 0 && (
          <h2 className="text-xl font-bold mb-4">Explore Detailed Meal Plans</h2>
        )}
      </div>
    </div>
  );
}