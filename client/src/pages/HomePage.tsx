import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  Stethoscope,
  Activity,
  Apple,
  Video,
  PillIcon,
  MessageSquareText,
  BellRing,
  Landmark,
  Globe,
  Brain,
  BarChart3,
} from "lucide-react";

const featureCards = [
  {
    id: 1,
    title: "Real-time Doctor Availability",
    description: "Find available doctors in your area for immediate consultations",
    icon: <Stethoscope className="h-6 w-6 text-primary" />,
    path: "/doctors",
  },
  {
    id: 2,
    title: "Symptom Checker",
    description: "Check your symptoms and get preliminary health advice",
    icon: <Activity className="h-6 w-6 text-primary" />,
    path: "/symptom-checker",
  },
  {
    id: 3,
    title: "Smart Diet Plans",
    description: "Get personalized diet plans based on your health conditions",
    icon: <Apple className="h-6 w-6 text-primary" />,
    path: "/diet-plans",
  },
  {
    id: 4,
    title: "Telemedicine (Video & Chat)",
    description: "Connect with doctors through video or chat consultations",
    icon: <Video className="h-6 w-6 text-primary" />,
    path: "/consultations",
  },
  {
    id: 5,
    title: "Medication & Appointment Reminders",
    description: "Never miss your medications or appointments again",
    icon: <PillIcon className="h-6 w-6 text-primary" />,
    path: "/reminders",
  },
  {
    id: 6,
    title: "Community Forum",
    description: "Discuss health topics with our community",
    icon: <MessageSquareText className="h-6 w-6 text-primary" />,
    path: "/forum",
  },
  {
    id: 7,
    title: "Emergency SOS Alerts",
    description: "Send emergency alerts to your contacts with location details",
    icon: <BellRing className="h-6 w-6 text-primary" />,
    path: "/emergency",
  },
  {
    id: 8,
    title: "Government Health Schemes",
    description: "Access information about government health support schemes",
    icon: <Landmark className="h-6 w-6 text-primary" />,
    path: "/health-schemes",
  },
  {
    id: 9,
    title: "Multilingual Support",
    description: "Use the platform in your preferred language",
    icon: <Globe className="h-6 w-6 text-primary" />,
    path: "/language",
  },
  {
    id: 10,
    title: "AI Health Recommendations",
    description: "Get AI-powered personalized health recommendations",
    icon: <Brain className="h-6 w-6 text-primary" />,
    path: "/ai-recommendations",
  },
  {
    id: 11,
    title: "Visual Health Reports & Analytics",
    description: "Visualize and track your health progress",
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    path: "/health-reports",
  },
];

export default function HomePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFeatures = featureCards.filter((feature) =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">AAROGYA</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive Rural Healthcare Platform
        </p>
        
        {!user && (
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/login">
              <Button variant="default">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search features..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => (
          <Card key={feature.id} className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardContent>
            <CardFooter>
              {feature.id === 4 ? (
                // Telemedicine card with multiple options
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/consultations?chat=true">
                      <MessageSquareText className="h-4 w-4 mr-1" />
                      Chat
                    </Link>
                  </Button>
                  <Button variant="default" className="flex-1" asChild>
                    <Link href="/consultations?video=true">
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={feature.path}>
                    Explore
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}