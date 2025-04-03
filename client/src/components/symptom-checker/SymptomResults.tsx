import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ConditionMatch, Symptom } from "@/utils/symptomLogic";

type SymptomResultsProps = {
  conditions: ConditionMatch[];
  selectedSymptoms: Symptom[];
  onReset: () => void;
};

export const SymptomResults = ({ conditions, selectedSymptoms, onReset }: SymptomResultsProps) => {
  if (!conditions.length) {
    return null;
  }

  const getSeverityIcon = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'moderate':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'mild':
        return <Info className="h-5 w-5 text-green-500" />;
    }
  };

  const getSeverityClass = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'mild':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Symptom Analysis Results</CardTitle>
          <CardDescription>
            Based on the {selectedSymptoms.length} symptom(s) you reported, here are the potential conditions to consider
          </CardDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSymptoms.map(symptom => (
              <Badge key={symptom.id} variant="outline">{symptom.symptom}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {conditions.map((condition, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(condition.severity)}
                      <span>{condition.condition}</span>
                    </div>
                    <Badge className={getSeverityClass(condition.severity)}>
                      {condition.severity}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <div>
                      <h4 className="font-medium">Matching Symptoms:</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {condition.symptoms.map((symptom, i) => (
                          <Badge key={i} variant="secondary" className="mr-1 mt-1">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Recommendation:</h4>
                      <p className="text-sm text-gray-600 mt-1">{condition.recommendation}</p>
                    </div>
                    
                    <div className="pt-2">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> This is not a medical diagnosis. Always consult with a qualified healthcare provider for proper evaluation.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onReset} className="w-full">
            Start New Symptom Check
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};