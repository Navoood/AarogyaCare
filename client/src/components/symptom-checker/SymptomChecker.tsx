import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<any | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch available symptoms
  const { data: symptomsData, isLoading } = useQuery({
    queryKey: ["/api/symptoms"],
  });

  // Filter symptoms based on search query
  const filteredSymptoms = symptomsData?.symptoms?.filter((symptom: any) =>
    symptom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check symptoms
  const checkSymptomsMutation = useMutation({
    mutationFn: async () => {
      setIsChecking(true);
      const response = await apiRequest("POST", "/api/symptom-check", {
        symptoms: selectedSymptoms,
        duration,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      setIsChecking(false);
      toast({
        title: "Symptoms Analyzed",
        description: `Found ${data.conditions.length} potential conditions based on your symptoms.`,
      });
    },
    onError: (error) => {
      setIsChecking(false);
      toast({
        title: "Error",
        description: "Could not analyze symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSymptom = (symptomId: string) => {
    if (!selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
    setSearchQuery("");
  };

  const handleRemoveSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((id) => id !== symptomId));
  };

  const handleCheckSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "No symptoms selected",
        description: "Please select at least one symptom to check.",
        variant: "destructive",
      });
      return;
    }

    if (!duration) {
      toast({
        title: "Duration not specified",
        description: "Please specify how long you've been experiencing these symptoms.",
        variant: "destructive",
      });
      return;
    }

    checkSymptomsMutation.mutate();
  };

  const getUrgencyColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-orange-100 text-orange-800";
      case 5:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Check Your Symptoms</CardTitle>
            <CardDescription>
              Enter your symptoms to get a preliminary assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="symptoms-search">Search symptoms</Label>
                <div className="relative">
                  <Input
                    id="symptoms-search"
                    placeholder="Type to search symptoms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && filteredSymptoms && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {isLoading ? (
                        <div className="px-2 py-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full mt-2" />
                          <Skeleton className="h-5 w-full mt-2" />
                        </div>
                      ) : filteredSymptoms.length > 0 ? (
                        filteredSymptoms.map((symptom: any) => (
                          <div
                            key={symptom.id}
                            className="px-2 py-2 hover:bg-primary-50 cursor-pointer"
                            onClick={() => handleAddSymptom(symptom.id)}
                          >
                            {symptom.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-center text-gray-500">
                          No symptoms found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Selected symptoms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSymptoms.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No symptoms selected
                    </div>
                  ) : (
                    selectedSymptoms.map((symptomId) => {
                      const symptom = symptomsData?.symptoms?.find(
                        (s: any) => s.id === symptomId
                      );
                      return (
                        <Badge
                          key={symptomId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {symptom?.name}
                          <button
                            onClick={() => handleRemoveSymptom(symptomId)}
                            className="ml-1 h-3 w-3 rounded-full text-xs flex items-center justify-center hover:bg-gray-200"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={duration}
                  onValueChange={setDuration}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="How long have you had these symptoms?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less_than_day">Less than a day</SelectItem>
                    <SelectItem value="1_2_days">1-2 days</SelectItem>
                    <SelectItem value="3_7_days">3-7 days</SelectItem>
                    <SelectItem value="more_than_week">More than a week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCheckSymptoms} 
              className="w-full"
              disabled={isChecking || selectedSymptoms.length === 0 || !duration}
            >
              {isChecking ? "Checking symptoms..." : "Check Symptoms"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        {results ? (
          <Card>
            <CardHeader>
              <CardTitle>Symptom Check Results</CardTitle>
              <CardDescription>
                Based on the symptoms you provided
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">Possible conditions</h3>
                  {results.conditions.length > 0 ? (
                    <ul className="space-y-3">
                      {results.conditions.map((condition: any) => (
                        <li key={condition.id} className="border-b pb-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{condition.name}</span>
                            <Badge
                              variant="outline"
                              className={getUrgencyColor(condition.urgencyLevel || 2)}
                            >
                              {condition.urgencyLevel >= 4 ? "Urgent" : "Common"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {condition.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center p-4 border rounded-md border-dashed">
                      <p className="text-gray-500">
                        No specific conditions match your symptoms.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-start">
                    <div className={`p-2 rounded-md ${
                      results.urgencyLevel >= 4 
                        ? "bg-red-100" 
                        : results.urgencyLevel >= 3 
                        ? "bg-yellow-100" 
                        : "bg-green-100"
                    }`}>
                      {results.urgencyLevel >= 4 ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Recommendation</h3>
                      <p className="text-sm text-gray-600">
                        {results.urgencyLevel >= 4 
                          ? "Seek medical attention promptly." 
                          : results.urgencyLevel >= 3 
                          ? "Consider consulting a doctor soon." 
                          : "Monitor your symptoms. Rest and stay hydrated."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/diet-plans">View Diet Recommendations</Link>
              </Button>
              <Button asChild>
                <Link href="/doctors">Find Doctor</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Symptom Check Results</CardTitle>
              <CardDescription>
                Your results will appear here after checking your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex flex-col items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Please enter your symptoms and duration on the left panel and click "Check Symptoms".</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
