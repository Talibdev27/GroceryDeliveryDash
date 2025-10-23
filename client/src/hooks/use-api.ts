import { useState, useEffect } from 'react';

// API base URL
// In development you can set VITE_API_BASE=http://localhost:3000/api
// In production we default to same-origin "/api" to avoid CORS issues
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '/api';

// Generic API hook for GET requests
export const useApi = <T>(endpoint: string, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define fetchData outside useEffect so it's accessible in return statement
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE}${endpoint}`;
      console.log(`🌐 API Request: GET ${url}`);
      
      const response = await fetch(url, {
        credentials: 'include', // Include cookies for authentication
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`, {
        url,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        // Try to get error details
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        console.error(`❌ API Error:`, {
          url,
          status: response.status,
          errorData
        });
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`✅ API Success:`, { url, dataKeys: Object.keys(result) });
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('💥 API Exception:', { endpoint, error: err });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Specific hooks for different data types
export const useProducts = () => {
  return useApi<{ products: any[] }>('/products');
};

export const useProduct = (id: string | number) => {
  return useApi<{ product: any }>(`/products/${id}`, [id]);
};

export const useCategories = () => {
  return useApi<{ categories: any[] }>('/categories');
};

export const useFeaturedProducts = () => {
  return useApi<{ products: any[] }>('/products/featured');
};

// API utility functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Try to get error details from response
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      console.error('API Request failed:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('API Request exception:', { endpoint, error });
    throw error;
  }
};

// Authentication API functions
export const authApi = {
  login: async (username: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// User API functions
export const userApi = {
  getProfile: async () => {
    return apiRequest('/user/profile');
  },

  updateProfile: async (userData: any) => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    return apiRequest('/user/password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  },

  getAddresses: async () => {
    return apiRequest('/user/addresses');
  },

  createAddress: async (addressData: any) => {
    return apiRequest('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  updateAddress: async (id: number, addressData: any) => {
    return apiRequest(`/user/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  deleteAddress: async (id: number) => {
    return apiRequest(`/user/addresses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Order API functions
export const orderApi = {
  getOrders: async () => {
    return apiRequest('/orders');
  },

  getOrder: async (id: number) => {
    return apiRequest(`/orders/${id}`);
  },

  createOrder: async (orderData: any) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
};

// Rider API functions
export const riderApi = {
  getAvailableOrders: async () => {
    return apiRequest('/rider/available-orders');
  },

  getMyDeliveries: async () => {
    return apiRequest('/rider/my-deliveries');
  },

  acceptOrder: async (orderId: number) => {
    return apiRequest(`/rider/accept-order/${orderId}`, {
      method: 'POST',
    });
  },

  updateDeliveryStatus: async (orderId: number, status: string) => {
    return apiRequest(`/rider/update-delivery-status/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getStats: async () => {
    return apiRequest('/rider/stats');
  },

  getOrderDetails: async (orderId: number) => {
    return apiRequest(`/rider/order/${orderId}`);
  },
};
