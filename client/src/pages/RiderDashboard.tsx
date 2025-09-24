import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Menu,
  X,
  Navigation,
  Truck,
  User,
  Phone,
  Map,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type RiderSection = "overview" | "orders" | "deliveries" | "earnings" | "profile";

export default function RiderDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<RiderSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Available Orders", icon: Package },
    { id: "deliveries", label: "My Deliveries", icon: Truck },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "profile", label: "Profile", icon: User },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <RiderOverview />;
      case "orders":
        return <AvailableOrders />;
      case "deliveries":
        return <MyDeliveries />;
      case "earnings":
        return <Earnings />;
      case "profile":
        return <RiderProfile />;
      default:
        return <RiderOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Rider Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 p-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <div className="px-3 py-2 mb-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-green-600">Rider</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={`w-full justify-start space-x-3 px-3 py-2.5 ${
                    activeSection === item.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveSection(item.id as RiderSection);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-56 flex-1">
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="p-4 lg:p-6">
              {/* Mobile header */}
              <div className="lg:hidden flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold">Rider Dashboard</h1>
                <div className="w-10" />
              </div>

              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function RiderOverview() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
        <h2 className="text-xl font-bold mb-1">Welcome back, Rider!</h2>
        <p className="text-green-100 text-sm">Ready to deliver? Check available orders below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Deliveries</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">4</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-green-600">125,000 сум</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AvailableOrders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Orders</h2>
        <Button>Refresh Orders</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((order) => (
          <Card key={order} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Order #{1200 + order}</CardTitle>
                <Badge variant="outline">Available</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Tashkent, Chilonzor District</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>30 min delivery time</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>15,000 сум delivery fee</span>
              </div>
              <div className="pt-2">
                <Button className="w-full" size="sm">
                  Accept Order
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MyDeliveries() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Deliveries</h2>
      <div className="space-y-4">
        {[1, 2, 3].map((delivery) => (
          <Card key={delivery}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order #{1200 + delivery}</p>
                    <p className="text-sm text-gray-600">Tashkent, Chilonzor</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    In Progress
                  </Badge>
                  <p className="text-sm text-gray-600">15,000 сум</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Earnings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Earnings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-green-600">125,000 сум</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-blue-600">875,000 сум</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">3,500,000 сум</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RiderProfile() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle>Rider Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-sm text-gray-900">John Doe</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="text-sm text-gray-900">+998 90 123 45 67</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Vehicle</label>
              <p className="text-sm text-gray-900">Motorcycle</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">License Plate</label>
              <p className="text-sm text-gray-900">01 A 123 BC</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


