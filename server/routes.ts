import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, verifyPassword } from "./storage";
import { insertUserSchema, insertAddressSchema } from "@shared/schema";
import { ZodError } from "zod";

// Extend the session interface to include our custom properties
declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

// Middleware to check if user is authenticated
const authenticateUser = (req: Request, res: Response, next: any) => {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Middleware to check if user has required role
const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: any) => {
    try {
      // Check if user is authenticated first
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }
      
      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
};

// Middleware to validate request body with Zod schema
const validateBody = (schema: any) => {
  return (req: Request, res: Response, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          error: "Validation error", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", validateBody(insertUserSchema), async (req: Request, res: Response) => {
    try {
      const { username, email, password, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Create new user
      const user = await storage.createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      console.log("🔐 Login attempt:", { username, passwordLength: password?.length });

      if (!username || !password) {
        console.log("❌ Missing credentials:", { username: !!username, password: !!password });
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Find user by username or email
      console.log("🔍 Searching for user by username:", username);
      let user = await storage.getUserByUsername(username);
      if (!user) {
        console.log("🔍 User not found by username, trying email:", username);
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        console.log("❌ User not found:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("✅ User found:", { id: user.id, username: user.username, email: user.email, role: user.role, isActive: user.isActive });

      // Check if user is active
      if (!user.isActive) {
        console.log("❌ User account is inactive:", user.id);
        return res.status(401).json({ error: "Account is inactive" });
      }

      // Verify password
      console.log("🔑 Verifying password...");
      const isValidPassword = await verifyPassword(password, user.password);
      console.log("🔑 Password verification result:", isValidPassword);
      
      if (!isValidPassword) {
        console.log("❌ Invalid password for user:", user.id);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      console.log("✅ Setting session for user:", user.id);
      req.session.userId = user.id;
      req.session.username = user.username;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      console.log("✅ Login successful for user:", user.id);
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // User profile routes
  app.get("/api/user/profile", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  });

  app.put("/api/user/profile", authenticateUser, async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, phone } = req.body;
      
      const updatedUser = await storage.updateUser(req.session.userId!, {
        firstName,
        lastName,
        email,
        phone,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.patch("/api/user/password", authenticateUser, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      // Get current user to verify current password
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      const updatedUser = await storage.updateUser(req.session.userId!, {
        password: hashedPassword,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  // Address routes
  app.get("/api/user/addresses", authenticateUser, async (req: Request, res: Response) => {
    try {
      const addresses = await storage.getUserAddresses(req.session.userId!);
      res.json({ addresses });
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ error: "Failed to get addresses" });
    }
  });

  app.post("/api/user/addresses", authenticateUser, validateBody(insertAddressSchema), async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const addressData = req.body;
      
      // Check for duplicate addresses
      const existingAddresses = await storage.getUserAddresses(userId);
      const isDuplicate = existingAddresses.some(addr => 
        addr.address.toLowerCase() === addressData.address.toLowerCase() &&
        addr.city.toLowerCase() === addressData.city.toLowerCase() &&
        addr.postalCode === addressData.postalCode
      );
      
      if (isDuplicate) {
        return res.status(400).json({ error: "This address already exists" });
      }
      
      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        await storage.unsetDefaultAddresses(userId);
      }
      
      const address = await storage.createAddress({
        ...addressData,
        userId,
      });
      res.status(201).json({ address });
    } catch (error) {
      console.error("Create address error:", error);
      res.status(500).json({ error: "Failed to create address" });
    }
  });

  app.put("/api/user/addresses/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const addressId = parseInt(req.params.id);
      const updatedAddress = await storage.updateAddress(addressId, req.body);
      
      if (!updatedAddress) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json({ address: updatedAddress });
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ error: "Failed to update address" });
    }
  });

  app.delete("/api/user/addresses/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const addressId = parseInt(req.params.id);
      const success = await storage.deleteAddress(addressId);
      
      if (!success) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ error: "Failed to delete address" });
    }
  });

  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json({ products });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Failed to get products" });
    }
  });

  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json({ products });
    } catch (error) {
      console.error("Get featured products error:", error);
      res.status(500).json({ error: "Failed to get featured products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ product });
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Failed to get product" });
    }
  });

  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json({ categories });
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Product Management routes (Admin/Product Manager)
  app.post("/api/admin/products", authenticateUser, requireRole(["super_admin", "admin", "product_manager"]), async (req: Request, res: Response) => {
    try {
      const { 
        name, nameRu, nameUz, 
        description, descriptionRu, descriptionUz, 
        price, salePrice, categoryId, stockQuantity, featured, sale, image, 
        unit, unitRu, unitUz, nutrition
      } = req.body;
      
      // Convert nutrition strings to numbers
      const nutritionData = nutrition ? {
        calories: parseFloat(nutrition.calories) || 0,
        fat: parseFloat(nutrition.fat) || 0,
        carbs: parseFloat(nutrition.carbs) || 0,
        protein: parseFloat(nutrition.protein) || 0
      } : null;
      
      const product = await storage.createProduct({
        name,
        nameRu,
        nameUz,
        description,
        descriptionRu,
        descriptionUz,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        categoryId: parseInt(categoryId),
        stockQuantity: parseInt(stockQuantity),
        featured: Boolean(featured),
        sale: Boolean(sale),
        image,
        unit: unit || "шт", // Default unit if not provided
        unitRu,
        unitUz,
        nutrition: nutritionData
      });
      
      res.status(201).json({ product });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", authenticateUser, requireRole(["super_admin", "admin", "product_manager"]), async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const { 
        name, nameRu, nameUz, 
        description, descriptionRu, descriptionUz, 
        price, salePrice, categoryId, stockQuantity, featured, sale, image, 
        unit, unitRu, unitUz, nutrition
      } = req.body;
      
      // Convert nutrition strings to numbers
      const nutritionData = nutrition ? {
        calories: parseFloat(nutrition.calories) || 0,
        fat: parseFloat(nutrition.fat) || 0,
        carbs: parseFloat(nutrition.carbs) || 0,
        protein: parseFloat(nutrition.protein) || 0
      } : null;
      
      const product = await storage.updateProduct(productId, {
        name,
        nameRu,
        nameUz,
        description,
        descriptionRu,
        descriptionUz,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        categoryId: parseInt(categoryId),
        stockQuantity: parseInt(stockQuantity),
        featured: Boolean(featured),
        sale: Boolean(sale),
        image,
        unit: unit || "шт", // Default unit if not provided
        unitRu,
        unitUz,
        nutrition: nutritionData
      });
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json({ product });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", authenticateUser, requireRole(["super_admin", "admin", "product_manager"]), async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Rider Management routes
  app.get("/api/admin/riders", authenticateUser, requireRole(["admin", "super_admin"]), async (req: Request, res: Response) => {
    try {
      console.log("📋 Fetching all riders for admin");
      const riders = await storage.getAllRiders();
      console.log(`✅ Found ${riders.length} riders`);
      res.json({ riders });
    } catch (error) {
      console.error("❌ Error fetching riders:", error);
      res.status(500).json({ error: "Failed to fetch riders" });
    }
  });

  app.post("/api/admin/riders", authenticateUser, requireRole(["admin", "super_admin"]), async (req: Request, res: Response) => {
    try {
      const { username, email, firstName, lastName, phone, password } = req.body;
      console.log("👤 Creating new rider:", { username, email, firstName, lastName });

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Create rider user
      const rider = await storage.createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        role: "rider",
      });

      console.log("✅ Rider created successfully:", rider.id);
      const { password: _, ...riderWithoutPassword } = rider;
      res.status(201).json({ rider: riderWithoutPassword });
    } catch (error) {
      console.error("❌ Error creating rider:", error);
      res.status(500).json({ error: "Failed to create rider" });
    }
  });

  app.put("/api/admin/riders/:id", authenticateUser, requireRole(["admin", "super_admin"]), async (req: Request, res: Response) => {
    try {
      const riderId = parseInt(req.params.id);
      const { username, email, firstName, lastName, phone, password } = req.body;
      console.log("✏️ Updating rider:", riderId);

      const updateData: any = {
        username,
        email,
        firstName,
        lastName,
        phone,
      };

      // Only update password if provided
      if (password && password.trim() !== "") {
        updateData.password = password;
      }

      const rider = await storage.updateUser(riderId, updateData);
      if (!rider) {
        return res.status(404).json({ error: "Rider not found" });
      }

      console.log("✅ Rider updated successfully:", riderId);
      const { password: _, ...riderWithoutPassword } = rider;
      res.json({ rider: riderWithoutPassword });
    } catch (error) {
      console.error("❌ Error updating rider:", error);
      res.status(500).json({ error: "Failed to update rider" });
    }
  });

  app.patch("/api/admin/riders/:id/status", authenticateUser, requireRole(["admin", "super_admin"]), async (req: Request, res: Response) => {
    try {
      const riderId = parseInt(req.params.id);
      const { isActive } = req.body;
      console.log("🔄 Updating rider status:", { riderId, isActive });

      const rider = await storage.updateUser(riderId, { isActive });
      if (!rider) {
        return res.status(404).json({ error: "Rider not found" });
      }

      console.log("✅ Rider status updated:", { riderId, isActive });
      const { password: _, ...riderWithoutPassword } = rider;
      res.json({ rider: riderWithoutPassword });
    } catch (error) {
      console.error("❌ Error updating rider status:", error);
      res.status(500).json({ error: "Failed to update rider status" });
    }
  });

  app.delete("/api/admin/riders/:id", authenticateUser, requireRole(["admin", "super_admin"]), async (req: Request, res: Response) => {
    try {
      const riderId = parseInt(req.params.id);
      console.log("🗑️ Deleting rider:", riderId);

      const success = await storage.deleteUser(riderId);
      if (!success) {
        return res.status(404).json({ error: "Rider not found" });
      }

      console.log("✅ Rider deleted successfully:", riderId);
      res.json({ message: "Rider deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting rider:", error);
      res.status(500).json({ error: "Failed to delete rider" });
    }
  });

  // Order assignment routes
  app.post("/api/admin/orders/:orderId/assign-rider", authenticateUser, requireRole(["admin", "super_admin"]), async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { riderId } = req.body;
      console.log("🚚 Assigning order to rider:", { orderId, riderId });

      if (!riderId) {
        return res.status(400).json({ error: "Rider ID is required" });
      }

      // Check if rider exists and is active
      const rider = await storage.getUser(riderId);
      if (!rider || rider.role !== "rider" || !rider.isActive) {
        return res.status(400).json({ error: "Invalid or inactive rider" });
      }

      // Assign rider to order
      const order = await storage.assignRiderToOrder(orderId, riderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      console.log("✅ Order assigned to rider successfully:", { orderId, riderId });
      res.json({ order });
    } catch (error) {
      console.error("❌ Error assigning order to rider:", error);
      res.status(500).json({ error: "Failed to assign order to rider" });
    }
  });

  app.get("/api/admin/riders/available", authenticateUser, requireRole(["admin", "super_admin"]), async (req: Request, res: Response) => {
    try {
      console.log("📋 Fetching available riders");
      const riders = await storage.getAvailableRiders();
      console.log(`✅ Found ${riders.length} available riders`);
      res.json({ riders });
    } catch (error) {
      console.error("❌ Error fetching available riders:", error);
      res.status(500).json({ error: "Failed to fetch available riders" });
    }
  });

  // Admin Order Management routes
  app.get("/api/admin/orders", authenticateUser, requireRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      
      // Enrich orders with user information
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const user = order.userId ? await storage.getUser(order.userId) : null;
          const address = order.addressId ? await storage.getAddress(order.addressId) : null;
          const items = await storage.getOrderItems(order.id);
          
          // Get product details for each item
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return {
                ...item,
                productName: product?.name || 'Unknown Product',
                productImage: product?.image || ''
              };
            })
          );
          
          return {
            ...order,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            userEmail: user?.email || '',
            userPhone: user?.phone || '',
            address: address,
            items: itemsWithProducts,
            itemCount: items.length
          };
        })
      );
      
      res.json({ orders: enrichedOrders });
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", authenticateUser, requireRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      console.log("📝 Order status update request:", {
        orderId: req.params.id,
        requestBody: req.body,
        userId: req.session?.userId,
        userRole: req.session?.user?.role
      });
      
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        console.error("❌ Status is missing from request body");
        return res.status(400).json({ error: "Status is required" });
      }
      
      const validStatuses = ["pending", "confirmed", "preparing", "ready", "in_transit", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        console.error("❌ Invalid status:", status);
        return res.status(400).json({ error: "Invalid status" });
      }
      
      console.log("✅ Updating order", orderId, "to status:", status);
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        console.error("❌ Order not found:", orderId);
        return res.status(404).json({ error: "Order not found" });
      }
      
      console.log("✅ Order status updated successfully:", { orderId, newStatus: status });
      res.json({ order });
    } catch (error) {
      console.error("❌ Update order status error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Order routes
  app.get("/api/orders", authenticateUser, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getUserOrders(req.session.userId!);
      res.json({ orders });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });

  app.get("/api/orders/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check if user owns this order
      if (order.userId !== req.session.userId!) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json({ order });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to get order" });
    }
  });

  app.post("/api/orders", authenticateUser, async (req: Request, res: Response) => {
    try {
      const { items, addressId, paymentMethod } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
      }
      
      if (!addressId || !paymentMethod) {
        return res.status(400).json({ error: "Address and payment method are required" });
      }
      
      // Validate that the address belongs to the user (security)
      const address = await storage.getAddress(addressId);
      if (!address || address.userId !== req.session.userId) {
        return res.status(403).json({ error: "Invalid address" });
      }
      
      // Fetch actual product prices from database (security: never trust client prices)
      let subtotal = 0;
      const validatedItems = [];
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        
        if (!product) {
          return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        
        if (!product.inStock || product.stockQuantity < item.quantity) {
          return res.status(400).json({ error: `Product ${product.name} is out of stock` });
        }
        
        // Use database prices, not client prices
        const price = product.sale && product.salePrice 
          ? parseFloat(product.salePrice) 
          : parseFloat(product.price);
        
        subtotal += price * item.quantity;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: price,
        });
      }
      
      const deliveryFee = 19000; // 19,000 UZS delivery fee (Yunusabad test rate)
      const tax = 0; // No tax for now
      const total = subtotal + deliveryFee + tax;

      const order = await storage.createOrder({
        userId: req.session.userId!,
        status: "pending",
        total: total.toString(),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        deliveryFee: deliveryFee.toString(),
        discount: "0",
        addressId,
        paymentMethod,
        paymentStatus: "pending",
      });

      console.log("🛒 Order created successfully:", order.id);

      // Save order items to database
      await storage.createOrderItems(order.id, validatedItems);
      console.log("🛒 Order items saved successfully");

      // Decrement stock quantity for each validated item
      for (const item of validatedItems) {
        await storage.decrementProductStock(item.productId, item.quantity);
      }

      res.status(201).json({ order });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Super Admin Routes
  app.get("/api/super-admin/users", requireRole(["super_admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.get("/api/super-admin/users/:id", requireRole(["super_admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/super-admin/users", requireRole(["super_admin"]), async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, role, permissions } = req.body;
      
      if (!username || !email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.createAdminUser({
        username,
        email,
        password,
        firstName,
        lastName,
        role,
        permissions
      });

      // Log the action
      await storage.logSystemAction({
        userId: req.session?.userId,
        action: "create_admin_user",
        resource: "users",
        resourceId: user.id,
        details: { role, permissions },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(user);
    } catch (error) {
      console.error("Create admin user error:", error);
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });

  app.put("/api/super-admin/users/:id/role", requireRole(["super_admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role, permissions } = req.body;
      
      const user = await storage.updateUserRole(id, role, permissions);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Log the action
      await storage.logSystemAction({
        userId: req.session?.userId,
        action: "update_user_role",
        resource: "users",
        resourceId: id,
        details: { role, permissions },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json(user);
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.put("/api/super-admin/users/:id/activate", requireRole(["super_admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.activateUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }

      // Log the action
      await storage.logSystemAction({
        userId: req.session?.userId,
        action: "activate_user",
        resource: "users",
        resourceId: id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Activate user error:", error);
      res.status(500).json({ error: "Failed to activate user" });
    }
  });

  app.put("/api/super-admin/users/:id/deactivate", requireRole(["super_admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deactivateUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }

      // Log the action
      await storage.logSystemAction({
        userId: req.session?.userId,
        action: "deactivate_user",
        resource: "users",
        resourceId: id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Deactivate user error:", error);
      res.status(500).json({ error: "Failed to deactivate user" });
    }
  });

  app.delete("/api/super-admin/users/:id", requireRole(["super_admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }

      // Log the action
      await storage.logSystemAction({
        userId: req.session?.userId,
        action: "delete_user",
        resource: "users",
        resourceId: id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/super-admin/logs", requireRole(["super_admin"]), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const logs = await storage.getSystemLogs(limit, offset);
      res.json(logs);
    } catch (error) {
      console.error("Get system logs error:", error);
      res.status(500).json({ error: "Failed to get system logs" });
    }
  });

  app.get("/api/super-admin/stats", requireRole(["super_admin"]), async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Get system stats error:", error);
      res.status(500).json({ error: "Failed to get system stats" });
    }
  });

  // Rider API endpoints
  app.get("/api/rider/available-orders", authenticateUser, async (req: Request, res: Response) => {
    try {
      // Check if user is a rider
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "rider") {
        return res.status(403).json({ error: "Access denied. Rider role required." });
      }

      const orders = await storage.getAvailableOrdersForRider();
      res.json({ orders });
    } catch (error) {
      console.error("Get available orders error:", error);
      res.status(500).json({ error: "Failed to get available orders" });
    }
  });

  app.get("/api/rider/my-deliveries", authenticateUser, async (req: Request, res: Response) => {
    try {
      // Check if user is a rider
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "rider") {
        return res.status(403).json({ error: "Access denied. Rider role required." });
      }

      const orders = await storage.getRiderOrders(req.session.userId!);
      res.json({ orders });
    } catch (error) {
      console.error("Get rider deliveries error:", error);
      res.status(500).json({ error: "Failed to get rider deliveries" });
    }
  });

  app.post("/api/rider/accept-order/:orderId", authenticateUser, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const riderId = req.session.userId!;

      // Check if user is a rider
      const user = await storage.getUser(riderId);
      if (!user || user.role !== "rider") {
        return res.status(403).json({ error: "Access denied. Rider role required." });
      }

      // Check if order exists and is available
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.status !== "ready") {
        return res.status(400).json({ error: "Order is not ready for pickup" });
      }

      if (order.riderAssignedId) {
        return res.status(400).json({ error: "Order is already assigned to another rider" });
      }

      // Assign order to rider
      const updatedOrder = await storage.assignRiderToOrder(orderId, riderId);
      res.json({ order: updatedOrder });
    } catch (error) {
      console.error("Accept order error:", error);
      res.status(500).json({ error: "Failed to accept order" });
    }
  });

  app.patch("/api/rider/update-delivery-status/:orderId", authenticateUser, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const riderId = req.session.userId!;
      const { status } = req.body;

      // Check if user is a rider
      const user = await storage.getUser(riderId);
      if (!user || user.role !== "rider") {
        return res.status(403).json({ error: "Access denied. Rider role required." });
      }

      // Check if order is assigned to this rider
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.riderAssignedId !== riderId) {
        return res.status(403).json({ error: "Order is not assigned to you" });
      }

      // Update delivery status
      const validStatuses = ["picked_up", "in_transit", "delivered"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedOrder = await storage.updateRiderDeliveryStatus(orderId, status);
      res.json({ order: updatedOrder });
    } catch (error) {
      console.error("Update delivery status error:", error);
      res.status(500).json({ error: "Failed to update delivery status" });
    }
  });

  app.get("/api/rider/stats", authenticateUser, async (req: Request, res: Response) => {
    try {
      const riderId = req.session.userId!;

      // Check if user is a rider
      const user = await storage.getUser(riderId);
      if (!user || user.role !== "rider") {
        return res.status(403).json({ error: "Access denied. Rider role required." });
      }

      const stats = await storage.getRiderStats(riderId);
      res.json(stats);
    } catch (error) {
      console.error("Get rider stats error:", error);
      res.status(500).json({ error: "Failed to get rider stats" });
    }
  });

  app.get("/api/rider/order/:orderId", authenticateUser, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const riderId = req.session.userId!;

      // Check if user is a rider
      const user = await storage.getUser(riderId);
      if (!user || user.role !== "rider") {
        return res.status(403).json({ error: "Access denied. Rider role required." });
      }

      // Get the order and verify it's assigned to this rider
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.riderAssignedId !== riderId) {
        return res.status(403).json({ error: "Order is not assigned to you" });
      }

      // Get enriched order details
      const riderOrders = await storage.getRiderOrders(riderId);
      const orderDetails = riderOrders.find(o => o.id === orderId);

      if (!orderDetails) {
        return res.status(404).json({ error: "Order details not found" });
      }

      res.json({ order: orderDetails });
    } catch (error) {
      console.error("Get rider order details error:", error);
      res.status(500).json({ error: "Failed to get order details" });
    }
  });

  // Review routes
  app.get("/api/products/:productId/reviews", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getProductReviews(productId);
      res.json({ reviews });
    } catch (error) {
      console.error("Get product reviews error:", error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });

  app.post("/api/products/:productId/reviews", authenticateUser, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const { rating, title, comment } = req.body;
      
      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      
      if (!title || !comment) {
        return res.status(400).json({ error: "Title and comment are required" });
      }
      
      const review = await storage.createReview({
        productId,
        userId: req.user!.id,
        rating: parseInt(rating),
        title,
        comment
      });
      
      res.status(201).json({ review });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
