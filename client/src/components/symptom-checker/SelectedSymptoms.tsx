import React from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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

type SelectedSymptomsProps = {
  symptoms: Symptom[];
  onRemove: (id: number) => void;
  onAnalyze: () => void;
};

export const SelectedSymptoms = ({ symptoms, onRemove, onAnalyze }: SelectedSymptomsProps) => {
  if (!symptoms.length) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    if (severity.includes('mild')) return 'bg-green-100 text-green-800';
    if (severity.includes('moderate')) return 'bg-yellow-100 text-yellow-800';
    if (severity.includes('severe')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };
  
  // Group symptoms by category
  const groupedSymptoms: Record<string, Symptom[]> = {};
  symptoms.forEach(symptom => {
    const category = symptom.category || 'General';
    if (!groupedSymptoms[category]) {
      groupedSymptoms[category] = [];
    }
    groupedSymptoms[category].push(symptom);
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Selected Symptoms ({symptoms.length})</CardTitle>
          <Badge variant="outline" className="ml-2">
            {symptoms.length} selected
          </Badge>
        </div>
        <CardDescription>
          Review your selected symptoms below. Add more symptoms or remove any that don't apply to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {symptoms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>No symptoms selected yet. Search and select symptoms above.</p>
          </div>
        ) : (
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-4">
              {Object.entries(groupedSymptoms).map(([category, categorySymptoms]) => (
                <div key={category} className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{category}</h3>
                  {categorySymptoms.map(symptom => (
                    <div 
                      key={symptom.id} 
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-md mb-2 border border-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{symptom.symptom}</h4>
                          <Badge className={getSeverityColor(symptom.severity)}>
                            {symptom.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{symptom.description}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemove(symptom.id)}
                        className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove {symptom.symptom}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Select at least 2 symptoms for better results
          </p>
          <Button 
            onClick={onAnalyze} 
            disabled={symptoms.length < 2}
            className="relative"
          >
            Analyze Symptoms
            {symptoms.length >= 2 && (
              <Badge className="absolute -top-2 -right-2 bg-white text-primary border border-primary">
                {symptoms.length}
              </Badge>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};