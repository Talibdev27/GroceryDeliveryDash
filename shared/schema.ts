import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // customer, admin, super_admin
  permissions: json("permissions"), // JSON array of specific permissions
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User addresses table
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  fullName: text("full_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("US"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEs: text("name_es"),
  nameAr: text("name_ar"),
  image: text("image").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEs: text("name_es"),
  nameAr: text("name_ar"),
  description: text("description").notNull(),
  descriptionEs: text("description_es"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  unit: text("unit").notNull(),
  unitEs: text("unit_es"),
  unitAr: text("unit_ar"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
  sale: boolean("sale").default(false),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  nutrition: json("nutrition"),
  allergens: json("allergens"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  estimatedDelivery: timestamp("estimated_delivery"),
  addressId: integer("address_id").references(() => addresses.id),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  // Rider assignment fields
  riderAssignedId: integer("rider_assigned_id").references(() => users.id),
  riderAssignedAt: timestamp("rider_assigned_at"),
  riderPickedUpAt: timestamp("rider_picked_up_at"),
  riderDeliveredAt: timestamp("rider_delivered_at"),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// User sessions table (for session management)
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// System logs table (for super admin monitoring)
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // login, logout, create_product, delete_user, etc.
  resource: text("resource"), // products, users, orders, etc.
  resourceId: integer("resource_id"), // ID of the affected resource
  details: json("details"), // Additional details about the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
}).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
});

export const insertAddressSchema = createInsertSchema(addresses).pick({
  title: true,
  fullName: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  isDefault: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  nameEs: true,
  nameAr: true,
  image: true,
  slug: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  nameEs: true,
  nameAr: true,
  description: true,
  descriptionEs: true,
  descriptionAr: true,
  price: true,
  image: true,
  categoryId: true,
  unit: true,
  unitEs: true,
  unitAr: true,
  inStock: true,
  featured: true,
  sale: true,
  salePrice: true,
  nutrition: true,
  allergens: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  total: true,
  subtotal: true,
  tax: true,
  deliveryFee: true,
  discount: true,
  estimatedDelivery: true,
  addressId: true,
  paymentMethod: true,
  paymentStatus: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;

// User role types
// System roles
// - customer: regular shopper
// - admin: store/admin dashboard access
// - super_admin: platform-wide control
// - rider: delivery driver account (new)
export type UserRole = "customer" | "admin" | "super_admin" | "rider";
export type Permission = 
  | "manage_products" 
  | "manage_users" 
  | "manage_orders" 
  | "view_analytics" 
  | "manage_settings" 
  | "view_logs" 
  | "manage_admins" 
  | "system_maintenance";
