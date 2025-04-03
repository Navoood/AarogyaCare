import React, { useState, useEffect } from 'react';
import { SymptomSearch } from '@/components/symptom-checker/SymptomSearch';
import { SelectedSymptoms } from '@/components/symptom-checker/SelectedSymptoms';
import { SymptomResults } from '@/components/symptom-checker/SymptomResults';
import { getAllSymptoms, analyzeSymptoms, ConditionMatch } from '@/utils/symptomLogic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Search, Activity, HelpCircle } from 'lucide-react';

// Update Symptom type to include category field
type Symptom = {
  id: number;
  symptom: string;
  description: string;
  possible_conditions: string[];
  severity: string;
  basic_treatment: string;
  when_to_consult: string;
  category?: string;
};

const SymptomCheckerPage = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [conditions, setConditions] = useState<ConditionMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    // Load all symptoms on component mount
    setSymptoms(getAllSymptoms());
  }, []);

  const handleSymptomSelect = (symptom: Symptom) => {
    // Check if symptom is already selected
    if (!selectedSymptoms.some(s => s.id === symptom.id)) {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  };

  const handleRemoveSymptom = (id: number) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const handleAnalyzeSymptoms = () => {
    const results = analyzeSymptoms(selectedSymptoms);
    setConditions(results);
    setShowResults(true);
    setActiveTab('results');
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setConditions([]);
    setShowResults(false);
    setActiveTab('search');
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Symptom Checker</h1>
        <p className="text-gray-600 mt-2">
          Search for your symptoms, select all that apply, and get information about possible conditions.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Follow these steps to check your symptoms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <Search className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">1. Search Symptoms</h3>
              <p className="text-sm text-gray-600">
                Enter your symptoms in the search box below
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">2. Select All That Apply</h3>
              <p className="text-sm text-gray-600">
                Add all symptoms you're experiencing
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <HelpCircle className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">3. Review Results</h3>
              <p className="text-sm text-gray-600">
                Get information about possible conditions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search Symptoms</TabsTrigger>
          <TabsTrigger value="results" disabled={!showResults}>View Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search for Symptoms</CardTitle>
              <CardDescription>
                Enter a symptom you're experiencing, like "headache" or "fever"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SymptomSearch 
                symptoms={symptoms}
                onSymptomSelect={handleSymptomSelect}
                selectedSymptoms={selectedSymptoms}
              />
              
              {selectedSymptoms.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> For more accurate results, add all symptoms you're experiencing.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <SelectedSymptoms 
            symptoms={selectedSymptoms}
            onRemove={handleRemoveSymptom}
            onAnalyze={handleAnalyzeSymptoms}
          />
        </TabsContent>
        
        <TabsContent value="results">
          {showResults && (
            <>
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('search')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Search
                </Button>
              </div>
              
              <SymptomResults 
                conditions={conditions}
                selectedSymptoms={selectedSymptoms}
                onReset={handleReset}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-gray-100 rounded-md text-center">
        <p className="text-sm text-gray-600">
          <strong>Disclaimer:</strong> This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
          Always seek the advice of qualified health providers with questions you may have regarding medical conditions.
        </p>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;