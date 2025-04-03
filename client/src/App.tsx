import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DoctorsPage from "./pages/DoctorsPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import DietPlansPage from "./pages/DietPlansPage";
import ConsultationsPage from "./pages/ConsultationsPage";
import RemindersPage from "./pages/RemindersPage";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Simple protection for routes that require authentication
  const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => {
    if (isLoading) {
      return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }
    
    return <Component />;
  };

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? DashboardPage : LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/doctors">
        <ProtectedRoute component={DoctorsPage} />
      </Route>
      <Route path="/symptom-checker">
        <ProtectedRoute component={SymptomCheckerPage} />
      </Route>
      <Route path="/diet-plans">
        <ProtectedRoute component={DietPlansPage} />
      </Route>
      <Route path="/consultations">
        <ProtectedRoute component={ConsultationsPage} />
      </Route>
      <Route path="/reminders">
        <ProtectedRoute component={RemindersPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
