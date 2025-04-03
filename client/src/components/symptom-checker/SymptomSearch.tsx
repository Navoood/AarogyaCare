import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

type SymptomSearchProps = {
  symptoms: Symptom[];
  onSymptomSelect: (symptom: Symptom) => void;
  selectedSymptoms: Symptom[];
};

export const SymptomSearch = ({ symptoms, onSymptomSelect, selectedSymptoms }: SymptomSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("search");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Get unique categories from symptoms
  const categories = ["all", ...Array.from(new Set(symptoms.map(s => s.category || "General")))].sort();

  // Filter symptoms by search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSymptoms([]);
      return;
    }

    const filtered = symptoms.filter(symptom => 
      symptom.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      symptom.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSymptoms(filtered);
  }, [searchQuery, symptoms]);

  // Get symptoms by category
  const getSymptomsByCategory = () => {
    if (activeCategory === "all") {
      return symptoms;
    }
    return symptoms.filter(s => s.category === activeCategory);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(query.trim() !== '');
  };

  const handleSymptomClick = (symptom: Symptom) => {
    onSymptomSelect(symptom);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredSymptoms.length > 0) {
      handleSymptomClick(filteredSymptoms[0]);
    }
  };

  const handleCheckboxChange = (symptom: Symptom, checked: boolean) => {
    if (checked) {
      onSymptomSelect(symptom);
    } else {
      // This will be handled in the parent component
    }
  };

  const getSeverityColor = (severity: string) => {
    if (severity.includes('mild')) return 'bg-green-100 text-green-800';
    if (severity.includes('moderate')) return 'bg-yellow-100 text-yellow-800';
    if (severity.includes('severe')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const isChecked = (id: number) => {
    return selectedSymptoms.some(s => s.id === id);
  };

  return (
    <div className="w-full relative">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Symptoms
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Browse by Category
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-4">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for symptoms (e.g., headache, fever, cough)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-md"
                onFocus={() => setShowSuggestions(searchQuery.trim() !== '')}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {showSuggestions && filteredSymptoms.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
              <ScrollArea className="max-h-64">
                <div className="p-2">
                  {filteredSymptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id={`search-symptom-${symptom.id}`}
                            checked={isChecked(symptom.id)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange(symptom, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={`search-symptom-${symptom.id}`} 
                            className="font-medium cursor-pointer"
                            onClick={() => handleSymptomClick(symptom)}
                          >
                            {symptom.symptom}
                          </label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge className={getSeverityColor(symptom.severity)}>
                                {symptom.severity}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Severity level</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-6">{symptom.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Select Symptoms by Category</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {activeCategory === "all" ? "All Categories" : activeCategory}
                </Badge>
              </div>
              <CardDescription>
                Browse and select the symptoms you're experiencing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <ScrollArea className="h-72 pr-4">
                <div className="space-y-4">
                  {getSymptomsByCategory().map((symptom) => (
                    <div 
                      key={symptom.id} 
                      className="flex items-start p-2 hover:bg-gray-50 rounded-md"
                    >
                      <Checkbox 
                        id={`browse-symptom-${symptom.id}`}
                        checked={isChecked(symptom.id)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(symptom, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <label 
                            htmlFor={`browse-symptom-${symptom.id}`} 
                            className="font-medium cursor-pointer"
                          >
                            {symptom.symptom}
                          </label>
                          <Badge className={getSeverityColor(symptom.severity)}>
                            {symptom.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{symptom.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};