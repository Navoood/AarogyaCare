import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
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
import { cn, getInitials } from "@/lib/utils";

interface MobileNavProps {
  onClose: () => void;
}

export default function MobileNav({ onClose }: MobileNavProps) {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Sidebar menu */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-lg">
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-primary-600">AAROGYA</h1>
          <button
            type="button"
            className="rounded-md text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="py-4 flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          {/* Profile Section */}
          <div className="px-4 py-4 border-b border-slate-200">
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
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-3 text-sm rounded-md",
                        isActive
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={onClose}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="px-4 py-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-3 w-full text-sm text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t("logout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
