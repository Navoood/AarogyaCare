import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { NotificationProvider } from "./context/NotificationContext";

// Create placeholder pages for all features
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">{title}</h1>
    <p className="text-muted-foreground">
      This feature is coming soon! We're working hard to make it available.
    </p>
  </div>
);

function RedirectToHome() {
  const [_, setLocation] = useLocation();
  // Redirect to home page instead of showing 404
  setLocation("/");
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/doctors">
        {() => <PlaceholderPage title="Doctor Availability" />}
      </Route>
      <Route path="/symptom-checker" component={SymptomCheckerPage} />
      <Route path="/diet-plans">
        {() => <PlaceholderPage title="Smart Diet Plans" />}
      </Route>
      <Route path="/consultations">
        {() => <PlaceholderPage title="Telemedicine Consultations" />}
      </Route>
      <Route path="/reminders">
        {() => <PlaceholderPage title="Medication & Appointment Reminders" />}
      </Route>
      <Route path="/forum">
        {() => <PlaceholderPage title="Community Forum" />}
      </Route>
      <Route path="/emergency">
        {() => <PlaceholderPage title="Emergency SOS Alerts" />}
      </Route>
      <Route path="/health-schemes">
        {() => <PlaceholderPage title="Government Health Schemes" />}
      </Route>
      <Route path="/language">
        {() => <PlaceholderPage title="Language Settings" />}
      </Route>
      <Route path="/ai-recommendations">
        {() => <PlaceholderPage title="AI Health Recommendations" />}
      </Route>
      <Route path="/health-reports">
        {() => <PlaceholderPage title="Health Reports & Analytics" />}
      </Route>
      <Route path="/profile">
        {() => <PlaceholderPage title="User Profile" />}
      </Route>
      <Route path="/about">
        {() => <PlaceholderPage title="About AAROGYA" />}
      </Route>
      <Route path="/privacy">
        {() => <PlaceholderPage title="Privacy Policy" />}
      </Route>
      <Route path="/terms">
        {() => <PlaceholderPage title="Terms of Service" />}
      </Route>
      <Route path="/contact">
        {() => <PlaceholderPage title="Contact Us" />}
      </Route>
      {/* Catch-all route that redirects to home instead of 404 */}
      <Route component={RedirectToHome} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
