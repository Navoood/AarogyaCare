import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Symptom = {
  id: number;
  symptom: string;
  description: string;
  possible_conditions: string[];
  severity: string;
  basic_treatment: string;
  when_to_consult: string;
};

type SymptomSearchProps = {
  symptoms: Symptom[];
  onSymptomSelect: (symptom: Symptom) => void;
};

export const SymptomSearch = ({ symptoms, onSymptomSelect }: SymptomSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const getSeverityColor = (severity: string) => {
    if (severity.includes('mild')) return 'bg-green-100 text-green-800';
    if (severity.includes('moderate')) return 'bg-yellow-100 text-yellow-800';
    if (severity.includes('severe')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="w-full relative">
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
                  onClick={() => handleSymptomClick(symptom)}
                  className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{symptom.symptom}</span>
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
                  <p className="text-sm text-gray-600">{symptom.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};