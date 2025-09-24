import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, verifyPassword } from "./storage";
import { insertUserSchema, insertAddressSchema } from "@shared/schema";
import { ZodError } from "zod";

// Middleware to check if user is authenticated
const authenticateUser = (req: Request, res: Response, next: any) => {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
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

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
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
      const user = await storage.getUser(req.session.userId);
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
      const user = await storage.getUser(req.session.userId);
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
      const { firstName, lastName, phone } = req.body;
      
      const updatedUser = await storage.updateUser(req.session.userId, {
        firstName,
        lastName,
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

  // Address routes
  app.get("/api/user/addresses", authenticateUser, async (req: Request, res: Response) => {
    try {
      const addresses = await storage.getUserAddresses(req.session.userId);
      res.json({ addresses });
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ error: "Failed to get addresses" });
    }
  });

  app.post("/api/user/addresses", authenticateUser, validateBody(insertAddressSchema), async (req: Request, res: Response) => {
    try {
      const address = await storage.createAddress({
        ...req.body,
        userId: req.session.userId,
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
  app.post("/api/admin/products", authenticateUser, async (req: Request, res: Response) => {
    try {
      const { name, description, price, salePrice, categoryId, stockQuantity, featured, sale, image, unit } = req.body;
      
      const product = await storage.createProduct({
        name,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        categoryId: parseInt(categoryId),
        stockQuantity: parseInt(stockQuantity),
        featured: Boolean(featured),
        sale: Boolean(sale),
        image,
        unit: unit || "pcs"
      });
      
      res.status(201).json({ product });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const { name, description, price, salePrice, categoryId, stockQuantity, featured, sale, image, unit } = req.body;
      
      const product = await storage.updateProduct(productId, {
        name,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        categoryId: parseInt(categoryId),
        stockQuantity: parseInt(stockQuantity),
        featured: Boolean(featured),
        sale: Boolean(sale),
        image,
        unit: unit || "pcs"
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

  app.delete("/api/admin/products/:id", authenticateUser, async (req: Request, res: Response) => {
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

  // Order routes
  app.get("/api/orders", authenticateUser, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getUserOrders(req.session.userId);
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
      if (order.userId !== req.session.userId) {
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
      
      // Calculate totals (this would be more complex in a real app)
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const deliveryFee = 2.99;
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + deliveryFee + tax;

      const order = await storage.createOrder({
        userId: req.session.userId,
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

      res.status(201).json({ order });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Super Admin Routes
  app.get("/api/super-admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.get("/api/super-admin/users/:id", async (req, res) => {
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

  app.post("/api/super-admin/users", async (req, res) => {
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

  app.put("/api/super-admin/users/:id/role", async (req, res) => {
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

  app.put("/api/super-admin/users/:id/activate", async (req, res) => {
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

  app.put("/api/super-admin/users/:id/deactivate", async (req, res) => {
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

  app.delete("/api/super-admin/users/:id", async (req, res) => {
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

  app.get("/api/super-admin/logs", async (req, res) => {
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

  app.get("/api/super-admin/stats", async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Get system stats error:", error);
      res.status(500).json({ error: "Failed to get system stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
