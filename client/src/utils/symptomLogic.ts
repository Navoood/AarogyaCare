import symptomData from '../data/symptoms.json';

export type Symptom = {
  id: number;
  symptom: string;
  description: string;
  possible_conditions: string[];
  severity: string;
  basic_treatment: string;
  when_to_consult: string;
  category?: string;
};

export type ConditionMatch = {
  condition: string;
  matchCount: number;
  matchScore: number;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  recommendation: string;
};

/**
 * Get all symptoms from the dataset
 */
export const getAllSymptoms = (): Symptom[] => {
  return symptomData as Symptom[];
};

/**
 * Find a symptom by its ID
 */
export const getSymptomById = (id: number): Symptom | undefined => {
  return getAllSymptoms().find(s => s.id === id);
};

/**
 * Find symptoms by search query
 */
export const findSymptomsByQuery = (query: string): Symptom[] => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return [];
  
  return getAllSymptoms().filter(symptom => 
    symptom.symptom.toLowerCase().includes(searchTerm) || 
    symptom.description.toLowerCase().includes(searchTerm)
  );
};

/**
 * Analyze user selected symptoms and identify possible conditions
 */
export const analyzeSymptoms = (selectedSymptoms: Symptom[]): ConditionMatch[] => {
  if (!selectedSymptoms.length) return [];
  
  // Create a map to count condition occurrences
  const conditionMap = new Map<string, { 
    count: number, 
    symptoms: string[],
    severityScore: number 
  }>();
  
  // Track all selected symptoms for each condition
  selectedSymptoms.forEach(symptom => {
    const severityValue = getSeverityValue(symptom.severity);
    
    symptom.possible_conditions.forEach(condition => {
      if (conditionMap.has(condition)) {
        const current = conditionMap.get(condition)!;
        conditionMap.set(condition, {
          count: current.count + 1,
          symptoms: [...current.symptoms, symptom.symptom],
          severityScore: current.severityScore + severityValue
        });
      } else {
        conditionMap.set(condition, {
          count: 1, 
          symptoms: [symptom.symptom],
          severityScore: severityValue
        });
      }
    });
  });
  
  // Convert map to array and sort by match count
  const results = Array.from(conditionMap.entries())
    .map(([condition, data]) => {
      const averageSeverity = data.severityScore / data.count;
      // Calculate a match score: combination of match count and severity
      const matchScore = data.count * (1 + (getSeverityValue(getSeverityLevel(averageSeverity)) / 3));
      // Remove duplicates by filtering
      const uniqueSymptoms = data.symptoms.filter((symptom, index, self) => 
        self.indexOf(symptom) === index
      );
      return {
        condition,
        matchCount: data.count,
        matchScore,
        symptoms: uniqueSymptoms,
        severity: getSeverityLevel(averageSeverity),
        recommendation: getRecommendation(condition, getSeverityLevel(averageSeverity))
      };
    })
    // Sort by match score (prioritizing both number of matches and severity)
    .sort((a, b) => b.matchScore - a.matchScore)
    // Limit to top 5 results
    .slice(0, 5);
  
  return results;
};

/**
 * Convert severity string to numeric value
 */
const getSeverityValue = (severity: string): number => {
  if (severity.includes('severe')) return 3;
  if (severity.includes('moderate')) return 2;
  return 1; // mild
};

/**
 * Convert numeric severity to level
 */
const getSeverityLevel = (score: number): 'mild' | 'moderate' | 'severe' => {
  if (score >= 2.5) return 'severe';
  if (score >= 1.5) return 'moderate';
  return 'mild';
};

/**
 * Get recommendation based on condition and severity
 */
const getRecommendation = (condition: string, severity: 'mild' | 'moderate' | 'severe'): string => {
  // General recommendations based on severity
  if (severity === 'severe') {
    return 'Consult a healthcare professional immediately. This may require urgent medical attention.';
  }
  
  if (severity === 'moderate') {
    return 'Schedule an appointment with a healthcare provider in the next few days. Monitor your symptoms closely.';
  }
  
  // Specific recommendations for common conditions
  switch (condition.toLowerCase()) {
    case 'common cold':
    case 'flu':
      return 'Rest, stay hydrated, and take over-the-counter medications for symptom relief. Consult a doctor if symptoms worsen.';
    case 'dehydration':
      return 'Increase fluid intake, especially water and electrolyte solutions. Avoid caffeine and alcohol.';
    case 'migraine':
      return 'Rest in a quiet, dark room. Take prescribed medications if available. Identify and avoid personal triggers.';
    case 'food poisoning':
      return 'Stay hydrated, rest, and eat bland foods once you can tolerate them. Seek medical help if symptoms are severe or persistent.';
    case 'allergic reaction':
      return 'Avoid the allergen if known. Take antihistamines if appropriate. For severe reactions, seek emergency care.';
    default:
      return 'Monitor your symptoms. Practice self-care with adequate rest and hydration. Consult a healthcare provider if symptoms persist or worsen.';
  }
};