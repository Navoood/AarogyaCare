import Layout from "@/components/layout/Layout";
import SymptomChecker from "@/components/symptom-checker/SymptomChecker";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function SymptomCheckerPage() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [initialSymptoms, setInitialSymptoms] = useState<string>("");
  const [initialDuration, setInitialDuration] = useState<string>("");

  // Parse URL parameters if any
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const symptoms = params.get("symptoms");
    const duration = params.get("duration");
    
    if (symptoms) setInitialSymptoms(symptoms);
    if (duration) setInitialDuration(duration);
  }, [location]);

  return (
    <Layout title={t("symptomChecker")}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Symptom Checker</h1>
          <p className="text-gray-600">
            Check your symptoms to get a preliminary assessment and health recommendations.
            This tool helps identify potential health issues but is not a substitute for professional medical advice.
          </p>
        </div>

        <div className="bg-primary-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="bg-primary-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Important Information</h3>
              <p className="text-sm text-gray-600 mt-1">
                This symptom checker provides general guidance based on the symptoms you enter.
                In case of severe symptoms or emergency, please contact a healthcare provider immediately
                or use the SOS button.
              </p>
            </div>
          </div>
        </div>

        <SymptomChecker 
          initialSymptoms={initialSymptoms} 
          initialDuration={initialDuration} 
        />

        <div className="mt-8 border-t pt-6">
          <h3 className="font-medium mb-3">Common Health Topics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium text-primary-600">Fever & Flu</h4>
              <p className="text-sm text-gray-600 mt-1">Common symptoms and management</p>
            </div>
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium text-primary-600">Digestive Issues</h4>
              <p className="text-sm text-gray-600 mt-1">Stomach pain, indigestion, diarrhea</p>
            </div>
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium text-primary-600">Respiratory Problems</h4>
              <p className="text-sm text-gray-600 mt-1">Breathing difficulty, cough, congestion</p>
            </div>
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium text-primary-600">Joint & Muscle Pain</h4>
              <p className="text-sm text-gray-600 mt-1">Arthritis, sprains, chronic pain</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
