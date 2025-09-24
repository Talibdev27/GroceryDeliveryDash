import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  UserPlus, 
  UserCheck, 
  UserX,
  Trash2,
  Eye,
  Crown,
  Database,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Menu
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Import super admin sections
import SuperAdminOverview from "@/components/super-admin/SuperAdminOverview";
import UserManagement from "@/components/super-admin/UserManagement";
import SystemLogs from "@/components/super-admin/SystemLogs";
import SystemSettings from "@/components/super-admin/SystemSettings";

type SuperAdminSection = "overview" | "users" | "logs" | "settings";

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [activeSection, setActiveSection] = useState<SuperAdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is super admin
  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the Super Admin Dashboard.
            </p>
            <Button onClick={() => window.location.href = "/admin"}>
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigationItems = [
    {
      id: "overview" as SuperAdminSection,
      label: "System Overview",
      icon: BarChart3,
      description: "System health and key metrics"
    },
    {
      id: "users" as SuperAdminSection,
      label: "User Management",
      icon: Users,
      description: "Manage all users and admin accounts"
    },
    {
      id: "logs" as SuperAdminSection,
      label: "System Logs",
      icon: Activity,
      description: "View system activity and audit logs"
    },
    {
      id: "settings" as SuperAdminSection,
      label: "System Settings",
      icon: Settings,
      description: "Configure system-wide settings"
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <SuperAdminOverview />;
      case "users":
        return <UserManagement />;
      case "logs":
        return <SystemLogs />;
      case "settings":
        return <SystemSettings />;
      default:
        return <SuperAdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Super Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <Badge variant="destructive" className="text-xs mt-1">Super Admin</Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`text-xs ${
                    activeSection === item.id ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.location.href = "/admin"}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.location.href = "/"}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Site
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.id === activeSection)?.label}
                </h1>
                <p className="text-sm text-gray-500">
                  {navigationItems.find(item => item.id === activeSection)?.description}
                </p>
              </div>
            </div>

            {/* Super Admin Badge */}
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-red-600" />
              <Badge variant="destructive">Super Admin</Badge>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
