import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { storage, verifyPassword, db } from "./storage";
import { validatePasswordSecurity } from "./utils/password-check";
import { insertUserSchema, insertAddressSchema, insertPromotionSchema, products as productsTable } from "@shared/schema";
import { ZodError } from "zod";
import { uploadImage, isCloudinaryConfigured } from "./cloudinary";

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
    // Check if session exists but is expired
    if (req.session) {
      res.status(401).json({ error: "Session expired" });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  }
};

// Middleware to check if user has required role
const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: any) => {
    try {
      // Check if user is authenticated first
      if (!req.session?.userId) {
        // Check if session exists but is expired
        if (req.session) {
          return res.status(401).json({ error: "Session expired" });
        }
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please log in again." });
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
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
  // Ensure DB has optional columns used by the current app version
  if ((storage as any).ensureOptionalColumns) {
    try {
      await (storage as any).ensureOptionalColumns();
    } catch (e) {
      console.error("Optional columns ensure failed:", e);
    }
  }

  // Rate limiting for authentication endpoints
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: "Too many login attempts. Please try again in 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour
    message: "Too many registration attempts. Please try again in an hour.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Authentication routes
  app.post("/api/auth/register", registerLimiter, validateBody(insertUserSchema), async (req: Request, res: Response) => {
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

      // Check if password has been breached
      const passwordCheck = await validatePasswordSecurity(password);
      if (!passwordCheck.isValid) {
        return res.status(400).json({ error: passwordCheck.error });
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

  app.post("/api/auth/login", loginLimiter, async (req: Request, res: Response) => {
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
      // Check if pagination parameters are provided
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
      const search = req.query.search as string | undefined;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const sort = req.query.sort as string | undefined;

      // If pagination params exist, use paginated endpoint
      if (page !== undefined || limit !== undefined || categoryId !== undefined || search || minPrice !== undefined || maxPrice !== undefined || sort) {
        const result = await storage.getProductsPaginated({
          page,
          limit,
          categoryId,
          search,
          minPrice,
          maxPrice,
          sort
        });
        res.json(result);
      } else {
        // Backward compatibility: return all products if no pagination params
        const products = await storage.getProducts();
        res.json({ products });
      }
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Failed to get products" });
    }
  });

  // Admin: list all products including out-of-stock
  app.get("/api/admin/products", authenticateUser, requireRole(["super_admin", "admin", "product_manager"]), async (_req: Request, res: Response) => {
    try {
      const all = await db.select().from(productsTable);
      res.json({ products: all });
    } catch (error) {
      console.error("Get all admin products error:", error);
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

  // Promotions routes
  app.get("/api/promotions", async (_req: Request, res: Response) => {
    try {
      const promos = await storage.getActivePromotions();
      res.json({ promotions: promos });
    } catch (error) {
      console.error("Get promotions error:", error);
      res.status(500).json({ error: "Failed to get promotions" });
    }
  });

  app.get("/api/admin/promotions", authenticateUser, requireRole(["super_admin", "admin"]), async (_req: Request, res: Response) => {
    try {
      const promos = await storage.listPromotions();
      res.json({ promotions: promos });
    } catch (error) {
      console.error("List promotions error:", error);
      res.status(500).json({ error: "Failed to list promotions" });
    }
  });

  app.post("/api/admin/promotions", authenticateUser, requireRole(["super_admin", "admin"]), (req: Request, res: Response, next) => {
    try {
      req.body = insertPromotionSchema.parse(req.body);
      next();
    } catch (e) {
      return res.status(400).json({ error: "Validation error" });
    }
  }, async (req: Request, res: Response) => {
    try {
      const promo = await storage.createPromotion(req.body);
      res.status(201).json({ promotion: promo });
    } catch (error) {
      console.error("Create promotion error:", error);
      res.status(500).json({ error: "Failed to create promotion" });
    }
  });

  app.put("/api/admin/promotions/:id", authenticateUser, requireRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const promo = await storage.updatePromotion(id, req.body);
      if (!promo) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.json({ promotion: promo });
    } catch (error) {
      console.error("Update promotion error:", error);
      res.status(500).json({ error: "Failed to update promotion" });
    }
  });

  app.delete("/api/admin/promotions/:id", authenticateUser, requireRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const ok = await storage.deletePromotion(id);
      if (!ok) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete promotion error:", error);
      res.status(500).json({ error: "Failed to delete promotion" });
    }
  });

  // Product Management routes (Admin/Product Manager)
  app.post("/api/admin/products", authenticateUser, requireRole(["super_admin", "admin", "product_manager"]), async (req: Request, res: Response) => {
    try {
      const { 
        name, nameRu, nameUz, 
        description, descriptionRu, descriptionUz, 
        price, salePrice, categoryId, stockQuantity, featured, sale, image, 
        unit, unitRu, unitUz, nutrition,
        // i18n new fields
        allergens, allergensRu, allergensUz,
        storageInstructions, storageInstructionsRu, storageInstructionsUz
      } = req.body;
      
      // Convert nutrition strings to numbers
      const nutritionData = nutrition ? {
        calories: parseFloat(nutrition.calories) || 0,
        fat: parseFloat(nutrition.fat) || 0,
        carbs: parseFloat(nutrition.carbs) || 0,
        protein: parseFloat(nutrition.protein) || 0,
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
        stockQuantity: Number.isFinite(parseInt(stockQuantity)) ? parseInt(stockQuantity) : 0,
        featured: Boolean(featured),
        sale: Boolean(sale),
        image,
        unit: unit || "шт", // Default unit if not provided
        unitRu,
        unitUz,
        nutrition: nutritionData,
        // i18n fields
        allergens: Array.isArray(allergens) ? allergens : (typeof allergens === 'string' ? allergens.split(',').map((s: string) => s.trim()).filter(Boolean) : null),
        allergensRu: Array.isArray(allergensRu) ? allergensRu : (typeof allergensRu === 'string' ? allergensRu.split(',').map((s: string) => s.trim()).filter(Boolean) : null),
        allergensUz: Array.isArray(allergensUz) ? allergensUz : (typeof allergensUz === 'string' ? allergensUz.split(',').map((s: string) => s.trim()).filter(Boolean) : null),
        storageInstructions: typeof storageInstructions === 'string' ? storageInstructions : (nutrition?.storageInstructions || null),
        storageInstructionsRu: typeof storageInstructionsRu === 'string' ? storageInstructionsRu : null,
        storageInstructionsUz: typeof storageInstructionsUz === 'string' ? storageInstructionsUz : null
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
        unit, unitRu, unitUz, nutrition,
        allergens, allergensRu, allergensUz,
        storageInstructions, storageInstructionsRu, storageInstructionsUz
      } = req.body;
      
      // Convert nutrition strings to numbers
      const nutritionData = nutrition ? {
        calories: parseFloat(nutrition.calories) || 0,
        fat: parseFloat(nutrition.fat) || 0,
        carbs: parseFloat(nutrition.carbs) || 0,
        protein: parseFloat(nutrition.protein) || 0,
      } : null;
      
      const parsedStock = Number.parseInt(stockQuantity);
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
        stockQuantity: Number.isFinite(parsedStock) ? parsedStock : (undefined as any),
        featured: Boolean(featured),
        sale: Boolean(sale),
        image,
        unit: unit || "шт", // Default unit if not provided
        unitRu,
        unitUz,
        nutrition: nutritionData,
        allergens: Array.isArray(allergens) ? allergens : (typeof allergens === 'string' ? allergens.split(',').map((s: string) => s.trim()).filter(Boolean) : null),
        allergensRu: Array.isArray(allergensRu) ? allergensRu : (typeof allergensRu === 'string' ? allergensRu.split(',').map((s: string) => s.trim()).filter(Boolean) : null),
        allergensUz: Array.isArray(allergensUz) ? allergensUz : (typeof allergensUz === 'string' ? allergensUz.split(',').map((s: string) => s.trim()).filter(Boolean) : null),
        storageInstructions: typeof storageInstructions === 'string' ? storageInstructions : (nutrition?.storageInstructions || null),
        storageInstructionsRu: typeof storageInstructionsRu === 'string' ? storageInstructionsRu : null,
        storageInstructionsUz: typeof storageInstructionsUz === 'string' ? storageInstructionsUz : null
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

  // Image upload endpoint
  // Get multer instance from app settings
  const upload = app.get("upload") as multer.Multer;
  if (!upload) {
    console.error("ERROR: Upload middleware not configured in app settings");
  }

  // Multer error handler middleware
  const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err.code, err.message);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
      console.error("Upload middleware error:", err);
      return res.status(400).json({ error: err.message || "File upload failed" });
    }
    next();
  };

  app.post(
    "/api/admin/upload-image",
    authenticateUser,
    requireRole(["super_admin", "admin", "product_manager"]),
    (req: Request, res: Response, next: any) => {
      // Check if Cloudinary is configured
      if (!isCloudinaryConfigured()) {
        console.error("Cloudinary configuration missing. Required env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        return res.status(500).json({ 
          error: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables." 
        });
      }
      next();
    },
    upload ? upload.single("image") : ((req: Request, res: Response, next: any) => {
      res.status(500).json({ error: "Upload middleware not configured" });
    }),
    handleMulterError,
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded. Please select an image file." });
        }

        console.log(`Uploading file: ${req.file.originalname}, size: ${req.file.size} bytes, type: ${req.file.mimetype}`);

        const result = await uploadImage(
          req.file.buffer,
          req.file.originalname,
          "products"
        );

        console.log(`Upload successful: ${result.url}`);

        res.json({ 
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format
        });
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload image to Cloudinary";
        console.error("Error details:", {
          message: errorMessage,
          stack: uploadError instanceof Error ? uploadError.stack : undefined
        });
        res.status(500).json({ 
          error: errorMessage
        });
      }
    }
  );

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
      console.log("=== ORDER CREATION START ===");
      console.log("User ID:", req.session.userId);
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      const { items, addressId, paymentMethod } = req.body;
      
      if (!items || items.length === 0) {
        console.log("❌ Invalid items:", items);
        return res.status(400).json({ error: "Order must contain at least one item" });
      }
      
      if (!addressId || !paymentMethod) {
        console.log("❌ Missing required fields:", { addressId, paymentMethod });
        return res.status(400).json({ error: "Address and payment method are required" });
      }
      
      console.log("✅ Validation passed");
      
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

      // Calculate estimated delivery time (30 minutes from now for ASAP, or based on selected time)
      const estimatedDelivery = new Date();
      estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 30); // Default: 30 minutes
      console.log("✅ Estimated delivery:", estimatedDelivery.toISOString());

      console.log("📦 Creating order in database...");
      console.log("📦 Order data:", {
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
        estimatedDelivery: estimatedDelivery,
      });
      
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
        estimatedDelivery: estimatedDelivery, // Date object - Drizzle will handle conversion
      });

      console.log("✅ Order created successfully:", order.id);

      // Save order items to database
      await storage.createOrderItems(order.id, validatedItems);
      console.log("🛒 Order items saved successfully");

      // Decrement stock quantity for each validated item
      for (const item of validatedItems) {
        await storage.decrementProductStock(item.productId, item.quantity);
      }

      // Send response first (non-blocking)
      res.status(201).json({ order });
      console.log("=== ORDER CREATION SUCCESS ===");

      // Try to send notifications (non-blocking - don't fail order if this fails)
      setImmediate(async () => {
        try {
          console.log("📢 Attempting to send admin notifications...");
          const io = app.get("io");
          
          if (!io) {
            console.warn("⚠️ Socket.io not initialized, skipping notifications");
            return;
          }
          
          // Get user info for notification
          const user = await storage.getUser(req.session.userId!);
          
          // Get order items count
          const orderItems = await storage.getOrderItems(order.id);
          
          // Prepare comprehensive notification data
          const notificationData = {
            id: `order-${order.id}-${Date.now()}`, // Unique ID for this notification
            type: "new-order",
            orderId: order.id,
            orderNumber: order.id,
            customerName: user?.firstName || user?.username || "Customer",
            customerEmail: user?.email,
            total: order.total,
            itemCount: orderItems?.length || 0,
            timestamp: new Date().toISOString(),
            message: `New order #${order.id} from ${user?.firstName || user?.username || "Customer"}`,
            priority: "high",
            read: false
          };
          
          console.log("🔔 Notification data prepared:", {
            orderId: notificationData.orderId,
            customerName: notificationData.customerName,
            total: notificationData.total,
            itemCount: notificationData.itemCount
          });
          
          // Notify all admins and super_admins using rooms
          const admins = await storage.getUsersByRole(["admin", "super_admin"]);
          
          if (!admins || admins.length === 0) {
            console.log("ℹ️ No admins found to notify");
            return;
          }
          
          console.log(`📢 Found ${admins.length} admin(s) to notify:`, admins.map(a => ({ id: a.id, email: a.email, role: a.role })));
          
          // Emit to general admin room (all admins receive this)
          console.log("📡 Emitting to 'admins' room...");
          io.to("admins").emit("new-order", notificationData);
          console.log("✅ Emitted to 'admins' room");
          
          // Also emit to individual admin rooms (for redundancy)
          let individualEmits = 0;
          for (const admin of admins) {
            try {
              console.log(`📡 Emitting to user-${admin.id} room...`);
              io.to(`user-${admin.id}`).emit("new-order", notificationData);
              individualEmits++;
              console.log(`✅ Emitted to user-${admin.id} room`);
            } catch (adminError) {
              console.warn(`⚠️ Failed to notify admin ${admin.id}:`, adminError);
            }
          }
          
          console.log(`✅ Notified ${admins.length} admin(s) about order #${order.id} (${individualEmits} individual emits)`);
        } catch (notificationError) {
          // Log but don't fail the order - notifications are non-critical
          console.warn("⚠️ Failed to send admin notifications (order still created successfully):", notificationError);
        }
      });
    } catch (error) {
      console.error("Create order error:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ 
        error: "Failed to create order",
        details: error instanceof Error ? error.message : String(error)
      });
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
  
  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || process.env.VITE_CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"]
    }
  });
  
  console.log("🔔 Socket.io initialized with CORS:", process.env.CLIENT_URL || process.env.VITE_CLIENT_URL || "http://localhost:5173");
  
  // Store connected users (userId -> socketId mapping)
  const connectedUsers = new Map();
  
  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);
    
    // Admin joins admin room
    socket.on("join-admin-room", (userId: number) => {
      socket.join(`user-${userId}`);
      socket.join("admins"); // General admin room
      connectedUsers.set(userId, socket.id);
      console.log(`👤 Admin user-${userId} joined admin rooms`);
    });
    
    // User joins their personal room (for future use)
    socket.on("join-user-room", (userId: number) => {
      socket.join(`user-${userId}`);
      connectedUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} joined their room`);
    });
    
    // Legacy register event (keep for backward compatibility)
    socket.on("register", (userId: number) => {
      socket.join(`user-${userId}`);
      connectedUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} registered with socket ${socket.id}`);
    });
    
    socket.on("disconnect", () => {
      // Remove user from connected users
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
      console.log("🔌 Client disconnected:", socket.id);
    });
  });
  
  // Make io available to routes
  app.set("io", io);
  app.set("connectedUsers", connectedUsers);
  
  return httpServer;
}
