import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { 
  users, 
  addresses, 
  categories, 
  products, 
  orders, 
  orderItems,
  systemLogs,
  type User, 
  type InsertUser,
  type Address,
  type InsertAddress,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type SystemLog,
  type UserRole,
  type Permission
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

// Load environment variables
config();

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Address operations
  getUserAddresses(userId: number): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress & { userId: number }): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: {
    name: string;
    description: string;
    price: number;
    salePrice?: number | null;
    categoryId: number;
    stockQuantity: number;
    featured: boolean;
    sale: boolean;
    image: string;
    unit: string;
  }): Promise<Product>;
  
  // Order operations
  getUserOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    // Hash password if it's being updated
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }


  // Address operations
  async getUserAddresses(userId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const result = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
    return result[0];
  }

  async createAddress(addressData: InsertAddress & { userId: number }): Promise<Address> {
    const result = await db.insert(addresses).values(addressData).returning();
    return result[0];
  }

  async updateAddress(id: number, addressData: Partial<InsertAddress>): Promise<Address | undefined> {
    const result = await db.update(addresses)
      .set({ ...addressData, updatedAt: new Date() })
      .where(eq(addresses.id, id))
      .returning();
    
    return result[0];
  }

  async deleteAddress(id: number): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(categoryData).returning();
    return result[0];
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.inStock, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(
      and(eq(products.categoryId, categoryId), eq(products.inStock, true))
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(
      and(eq(products.featured, true), eq(products.inStock, true))
    );
  }


  // Order operations
  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(orderData).returning();
    return result[0];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    
    return result[0];
  }

  // Product Management Methods
  async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    salePrice?: number | null;
    categoryId: number;
    stockQuantity: number;
    featured: boolean;
    sale: boolean;
    image: string;
    unit: string;
  }): Promise<Product> {
    const result = await db.insert(products).values({
      name: productData.name,
      description: productData.description,
      price: productData.price.toString(),
      salePrice: productData.salePrice?.toString(),
      categoryId: productData.categoryId,
      unit: productData.unit,
      inStock: productData.stockQuantity > 0,
      featured: productData.featured,
      sale: productData.sale,
      image: productData.image
    }).returning();
    
    return result[0];
  }

  async updateProduct(id: number, productData: {
    name: string;
    description: string;
    price: number;
    salePrice?: number | null;
    categoryId: number;
    stockQuantity: number;
    featured: boolean;
    sale: boolean;
    image: string;
    unit: string;
  }): Promise<Product | undefined> {
    const result = await db.update(products)
      .set({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        salePrice: productData.salePrice?.toString(),
        categoryId: productData.categoryId,
        unit: productData.unit,
        inStock: productData.stockQuantity > 0,
        featured: productData.featured,
        sale: productData.sale,
        image: productData.image,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products)
      .where(eq(products.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Super Admin Methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async updateUserRole(id: number, role: UserRole, permissions?: Permission[]): Promise<User | null> {
    const result = await db.update(users)
      .set({ 
        role, 
        permissions: permissions || null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return result[0] || null;
  }

  async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    permissions?: Permission[];
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await db.insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        permissions: userData.permissions || null,
        isActive: true
      })
      .returning();
    
    return result[0];
  }

  async deactivateUser(id: number): Promise<boolean> {
    const result = await db.update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0;
  }

  async activateUser(id: number): Promise<boolean> {
    const result = await db.update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users)
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0;
  }

  async logSystemAction(logData: {
    userId?: number;
    action: string;
    resource?: string;
    resourceId?: number;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<SystemLog> {
    const result = await db.insert(systemLogs)
      .values({
        userId: logData.userId,
        action: logData.action,
        resource: logData.resource,
        resourceId: logData.resourceId,
        details: logData.details,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent
      })
      .returning();
    
    return result[0];
  }

  async getSystemLogs(limit: number = 100, offset: number = 0): Promise<SystemLog[]> {
    return await db.select()
      .from(systemLogs)
      .orderBy(systemLogs.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalCategories: number;
    recentLogins: number;
  }> {
    const [userStats, productStats, orderStats, categoryStats, recentLogins] = await Promise.all([
      db.select({ 
        id: users.id,
        isActive: users.isActive 
      }).from(users),
      db.select({ id: products.id }).from(products),
      db.select({ id: orders.id }).from(orders),
      db.select({ id: categories.id }).from(categories),
      db.select({ id: users.id }).from(users)
        .where(eq(users.lastLoginAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))
    ]);

    return {
      totalUsers: userStats.length,
      activeUsers: userStats.filter(u => u.isActive).length,
      totalProducts: productStats.length,
      totalOrders: orderStats.length,
      totalCategories: categoryStats.length,
      recentLogins: recentLogins.length
    };
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }
}

// Export the database storage instance
export const storage = new DatabaseStorage();

// Password verification utility
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
