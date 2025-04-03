import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import EmergencySOS from "../common/EmergencySOS";
import { useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [_, navigate] = useLocation();

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto focus:outline-none md:ml-64">
        {/* Top Navigation (mobile) */}
        <div className="md:hidden border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className="text-xl font-bold text-primary-600">AAROGYA</h1>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700"
              onClick={toggleMobileNav}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sidebar */}
        {mobileNavOpen && (
          <MobileNav onClose={() => setMobileNavOpen(false)} />
        )}

        {/* Dashboard Header */}
        <div className="py-6 px-4 sm:px-6 lg:px-8 bg-white border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => markAllAsRead()}
                        className="text-xs"
                      >
                        Mark all as read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="py-4 px-2 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <>
                      {notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem 
                          key={notification.id}
                          className="py-3 px-4 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{notification.title}</span>
                              {!notification.read && (
                                <Badge variant="secondary" className="ml-2 bg-primary-100 text-primary-700 hover:bg-primary-100">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <span className="text-xs text-gray-400 mt-1">
                              {timeAgo(notification.timestamp)}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {notifications.length > 5 && (
                        <DropdownMenuItem 
                          className="py-2 px-4 text-center"
                          onClick={() => navigate("/notifications")}
                        >
                          <span className="text-sm text-primary-600">View all</span>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Emergency SOS Button */}
      <EmergencySOS />
    </div>
  );
}
