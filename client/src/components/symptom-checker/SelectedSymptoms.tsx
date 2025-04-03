import React from 'react';
import { Symptom } from '@/utils/symptomLogic';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    if (severity.includes('severe')) return 'bg-red-100 text-red-800';
    if (severity.includes('moderate')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800'; // mild
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Selected Symptoms</CardTitle>
        <CardDescription>
          Review your selected symptoms below. Add more symptoms or remove any that don't apply to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {symptoms.map(symptom => (
            <div key={symptom.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
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
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove {symptom.symptom}</span>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={onAnalyze} disabled={symptoms.length === 0}>
            Analyze Symptoms ({symptoms.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};