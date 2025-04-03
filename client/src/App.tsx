import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { NotificationProvider } from "./context/NotificationContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <Router />
          <Toaster />
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
