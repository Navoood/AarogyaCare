import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-xl overflow-hidden shadow-lg">
        {/* Left side - Form */}
        <Card className="border-0 rounded-none">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-primary-600">AAROGYA</h1>
            <p className="text-slate-500 mt-2">
              AI-Powered Rural Healthcare Platform
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <LoginForm />
          </CardContent>
        </Card>

        {/* Right side - Image/Info */}
        <div className="hidden md:block bg-primary-600 text-white p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6">Welcome to Aarogya Healthcare</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Access to Healthcare Anywhere</h3>
                <p className="text-white/80 text-sm">
                  Connect with qualified doctors through video consultations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Symptom Checking & Health Advice</h3>
                <p className="text-white/80 text-sm">
                  Get preliminary health assessments and personalized recommendations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Health Records & Medication Tracking</h3>
                <p className="text-white/80 text-sm">
                  Manage your health information and get medication reminders
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-sm text-white/70">
              Aarogya is designed to bring quality healthcare to rural areas through technology,
              making healthcare accessible to everyone regardless of location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
