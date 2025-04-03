import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

export default function RegisterPage() {
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
              Create your account to get started
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <RegisterForm />
          </CardContent>
        </Card>

        {/* Right side - Image/Info */}
        <div className="hidden md:block bg-primary-600 text-white p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6">Join Aarogya Healthcare</h2>
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
                <h3 className="font-medium">For Patients</h3>
                <p className="text-white/80 text-sm">
                  Access telemedicine, symptom checking, medication reminders, and personalized health insights
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
                <h3 className="font-medium">For Doctors</h3>
                <p className="text-white/80 text-sm">
                  Manage your practice, provide telemedicine consultations, and help rural communities
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
                <h3 className="font-medium">Multiple Language Support</h3>
                <p className="text-white/80 text-sm">
                  Use the platform in your preferred language, including regional Indian languages
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-sm text-white/70">
              By creating an account, you'll be contributing to our mission of bringing quality healthcare to rural areas through technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
