import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Truck, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Search,
  Filter
} from "lucide-react";

interface Rider {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  // Stats
  totalDeliveries?: number;
  completedDeliveries?: number;
  activeDeliveries?: number;
  averageRating?: number;
}

export default function RiderManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  });

  // Log authentication state
  useEffect(() => {
    console.log("🔐 RiderManagement - Auth state:", {
      isAuthenticated: !!user,
      role: user?.role,
      canAccessRiders: user?.role === 'admin' || user?.role === 'super_admin'
    });
  }, [user]);

  // Fetch riders
  const { data: ridersData, loading: ridersLoading, error: ridersError, refetch: refetchRiders } = useApi<{ riders: Rider[] }>("/admin/riders");

  useEffect(() => {
    console.log("🔍 RiderManagement - useApi state:", {
      ridersData,
      ridersLoading,
      ridersError,
      endpoint: "/api/admin/riders"
    });
    
    if (ridersData?.riders) {
      console.log("✅ Riders data received:", ridersData.riders.length, "riders");
      setRiders(ridersData.riders);
    } else if (ridersData) {
      console.warn("⚠️ Unexpected data format:", ridersData);
    }
    
    if (ridersError) {
      console.error("❌ Riders error:", ridersError);
    }
    
    setLoading(ridersLoading);
  }, [ridersData, ridersLoading, ridersError]);

  // Filter riders based on search and status
  const filteredRiders = riders.filter(rider => {
    const matchesSearch = rider.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${rider.firstName} ${rider.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && rider.isActive) ||
                         (filterStatus === "inactive" && !rider.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateRider = async () => {
    try {
      const response = await fetch("/api/admin/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create rider");
      }

      toast({
        title: "Success",
        description: "Rider created successfully!",
      });

      setIsCreateDialogOpen(false);
      setFormData({ username: "", email: "", firstName: "", lastName: "", phone: "", password: "" });
      refetchRiders();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create rider",
        variant: "destructive",
      });
    }
  };

  const handleEditRider = async () => {
    if (!selectedRider) return;

    try {
      const response = await fetch(`/api/admin/riders/${selectedRider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update rider");
      }

      toast({
        title: "Success",
        description: "Rider updated successfully!",
      });

      setIsEditDialogOpen(false);
      setSelectedRider(null);
      refetchRiders();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update rider",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (riderId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/riders/${riderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update rider status");
      }

      toast({
        title: "Success",
        description: `Rider ${!isActive ? "activated" : "deactivated"} successfully!`,
      });

      refetchRiders();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update rider status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRider = async (riderId: number) => {
    if (!confirm("Are you sure you want to delete this rider? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/riders/${riderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete rider");
      }

      toast({
        title: "Success",
        description: "Rider deleted successfully!",
      });

      refetchRiders();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete rider",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (rider: Rider) => {
    setSelectedRider(rider);
    setFormData({
      username: rider.username,
      email: rider.email,
      firstName: rider.firstName,
      lastName: rider.lastName,
      phone: rider.phone || "",
      password: "", // Don't pre-fill password
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading riders...</p>
        </div>
      </div>
    );
  }

  if (ridersError) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Riders</h3>
        <p className="text-neutral-600 mb-2">Failed to load riders. Please try again.</p>
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 max-w-md mx-auto">
          <p className="text-sm text-red-800 font-mono">{ridersError}</p>
        </div>
        <Button onClick={() => refetchRiders()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rider Management</h2>
          <p className="text-neutral-600">Manage delivery riders and their assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Rider</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRider}>Create Rider</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Riders</p>
                <p className="text-2xl font-bold">{riders.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Riders</p>
                <p className="text-2xl font-bold text-green-600">{riders.filter(r => r.isActive).length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Inactive Riders</p>
                <p className="text-2xl font-bold text-red-600">{riders.filter(r => !r.isActive).length}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Deliveries</p>
                <p className="text-2xl font-bold text-orange-600">
                  {riders.reduce((sum, r) => sum + (r.activeDeliveries || 0), 0)}
                </p>
              </div>
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search riders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            className="px-3 py-2 border border-neutral-300 rounded-md"
          >
            <option value="all">All Riders</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Riders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riders ({filteredRiders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rider</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRiders.map((rider) => (
                <TableRow key={rider.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rider.firstName} {rider.lastName}</p>
                      <p className="text-sm text-neutral-500">@{rider.username}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{rider.email}</p>
                      {rider.phone && <p className="text-sm text-neutral-500">{rider.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rider.isActive ? "default" : "secondary"}>
                      {rider.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Total: {rider.totalDeliveries || 0}</p>
                      <p className="text-green-600">Completed: {rider.completedDeliveries || 0}</p>
                      <p className="text-orange-600">Active: {rider.activeDeliveries || 0}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">
                        {rider.averageRating ? rider.averageRating.toFixed(1) : "N/A"}
                      </span>
                      {rider.averageRating && (
                        <span className="text-sm text-neutral-500 ml-1">⭐</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {rider.lastLoginAt ? (
                        <span>{new Date(rider.lastLoginAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-neutral-500">Never</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(rider)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(rider.id, rider.isActive)}
                      >
                        {rider.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRider(rider.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone (Optional)</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">New Password (Leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRider}>Update Rider</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
