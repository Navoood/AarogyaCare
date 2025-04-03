import { useAuth } from "@/context/AuthContext";
import { cn, getInitials } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import {
  Home,
  User,
  CheckCircle,
  Activity,
  Video,
  Clock,
  MessageSquare,
  BarChart3,
  Building,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { t } = useLanguage();

  const navigation = [
    { name: t("dashboard"), href: "/dashboard", icon: Home },
    { name: t("doctors"), href: "/doctors", icon: User },
    { name: t("symptomChecker"), href: "/symptom-checker", icon: CheckCircle },
    { name: t("dietPlans"), href: "/diet-plans", icon: Activity },
    { name: t("consultations"), href: "/consultations", icon: Video },
    { name: t("reminders"), href: "/reminders", icon: Clock },
    { name: t("community"), href: "/community", icon: MessageSquare },
    { name: t("govtSchemes"), href: "/government-schemes", icon: Building },
    { name: t("analytics"), href: "/analytics", icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 border-r border-slate-200 bg-white z-30">
      <div className="flex items-center h-16 px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-primary-600">AAROGYA</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md",
                    isActive
                      ? "bg-primary-50 text-primary-600 font-medium"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Profile Section */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {user ? getInitials(user.fullName) : "??"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {user ? user.fullName : "Guest User"}
              </p>
              <p className="text-xs text-slate-500">
                {user ? t(user.role) : "Not logged in"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-700"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
