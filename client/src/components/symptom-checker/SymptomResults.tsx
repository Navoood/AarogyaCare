import React from 'react';
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, ThumbsUp, ChevronRight, Video } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ConditionMatch, Symptom } from "@/utils/symptomLogic";
import { Progress } from "@/components/ui/progress";

type SymptomResultsProps = {
  conditions: ConditionMatch[];
  selectedSymptoms: Symptom[];
  onReset: () => void;
};

export const SymptomResults = ({ conditions, selectedSymptoms, onReset }: SymptomResultsProps) => {
  if (!conditions.length) {
    return null;
  }

  // Find max match score to calculate relative percentages
  const maxMatchScore = Math.max(...conditions.map(c => c.matchScore));

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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "";  // The default is primary color
    if (percentage >= 50) return "bg-amber-500";
    return "bg-gray-400";
  };

  const getConfidenceLabel = (percentage: number) => {
    if (percentage >= 85) return "High";
    if (percentage >= 60) return "Moderate";
    return "Low";
  };

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-primary" />
            Analysis Results (Top {conditions.length})
          </CardTitle>
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
          <div className="space-y-4 mb-4">
            {conditions.map((condition, index) => {
              const matchPercentage = Math.round((condition.matchScore / maxMatchScore) * 100);
              
              return (
                <Card key={index} className="relative overflow-hidden border border-gray-200">
                  <div 
                    className="absolute top-0 left-0 bottom-0 w-1" 
                    style={{ 
                      backgroundColor: index === 0 ? '#ff4757' : index === 1 ? '#ffa502' : '#2ed573',
                      opacity: index === 0 ? 1 : (1 - (index * 0.15))
                    }}
                  />
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 sm:col-span-5">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(condition.severity)}
                          <h3 className="font-semibold">{condition.condition}</h3>
                          {index === 0 && (
                            <Badge className="ml-2 bg-primary">Most Likely</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {condition.symptoms.slice(0, 3).map((symptom, i) => (
                            <Badge key={i} variant="secondary" className="mr-1 mt-1">
                              {symptom}
                            </Badge>
                          ))}
                          {condition.symptoms.length > 3 && (
                            <Badge variant="outline" className="mr-1 mt-1">
                              +{condition.symptoms.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="col-span-12 sm:col-span-3">
                        <Badge className={getSeverityClass(condition.severity)}>
                          {condition.severity} severity
                        </Badge>
                      </div>
                      <div className="col-span-12 sm:col-span-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Match confidence</span>
                            <span className="text-sm font-medium">{getConfidenceLabel(matchPercentage)}</span>
                          </div>
                          <Progress 
                            value={matchPercentage} 
                            className={`h-2 ${getProgressColor(matchPercentage)}`}
                          />
                        </div>
                      </div>
                    </div>
                    <Accordion type="single" collapsible className="w-full mt-3">
                      <AccordionItem value="details">
                        <AccordionTrigger className="pt-0 pb-1 text-sm text-primary">
                          View details and recommendations
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-1">
                            <div>
                              <h4 className="font-medium text-sm">Matching Symptoms: {condition.matchCount}/{selectedSymptoms.length}</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {condition.symptoms.map((symptom, i) => (
                                  <Badge key={i} variant="secondary" className="mr-1 mt-1">
                                    {symptom}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm">Recommendation:</h4>
                              <p className="text-sm text-gray-600 mt-1">{condition.recommendation}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md mt-6">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Important Medical Disclaimer
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  This analysis is for informational purposes only and not a medical diagnosis. 
                  Always consult with a qualified healthcare provider for proper evaluation and diagnosis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onReset} className="w-full">
            Start New Symptom Check
          </Button>
          <Link href="/doctors" className="w-full">
            <Button variant="default" className="w-full">
              <span>Find Doctors Near You</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link href="/consultations" className="w-full">
            <Button variant="secondary" className="w-full">
              <Video className="h-4 w-4 mr-2" />
              <span>Start Video Consultation</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};