import { useState } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "customer" | "admin" | "super_admin";
  permissions?: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface SystemLog {
  id: number;
  userId?: number;
  action: string;
  resource?: string;
  resourceId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  recentLogins: number;
}

export const useSuperAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (): Promise<User[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/super-admin/users", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (id: number): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/super-admin/users/${id}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: "customer" | "admin" | "super_admin";
    permissions?: string[];
  }): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        throw new Error("Failed to create admin user");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (id: number, role: string, permissions?: string[]): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/super-admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ role, permissions })
      });
      if (!response.ok) {
        throw new Error("Failed to update user role");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/super-admin/users/${id}/activate`, {
        method: "PUT",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to activate user");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/super-admin/users/${id}/deactivate`, {
        method: "PUT",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to deactivate user");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/super-admin/users/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemLogs = async (limit: number = 100, offset: number = 0): Promise<SystemLog[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/super-admin/logs?limit=${limit}&offset=${offset}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch system logs");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async (): Promise<SystemStats> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/super-admin/stats", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch system stats");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchUsers,
    fetchUser,
    createAdminUser,
    updateUserRole,
    activateUser,
    deactivateUser,
    deleteUser,
    fetchSystemLogs,
    fetchSystemStats
  };
};
