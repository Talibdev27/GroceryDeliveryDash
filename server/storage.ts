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
  reviews,
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
  type Review,
  type InsertReview,
  type SystemLog,
  type UserRole,
  type Permission
} from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";
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
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
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
    console.log("💾 Fetching user orders with items and address for userId:", userId);
    
    // Get all orders for the user
    const userOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(sql`${orders.createdAt} DESC`);
    
    console.log("💾 Found orders:", userOrders.length);
    
    // For each order, fetch its items with product details and address
    const ordersWithDetails = await Promise.all(
      userOrders.map(async (order) => {
        console.log("💾 Processing order:", order.id);
        
        // Fetch order items with product details
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          productName: products.name,
          productImage: products.image,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));
        
        console.log("💾 Order", order.id, "items:", items.length);
        
        // Fetch address if addressId exists
        let addressData = null;
        if (order.addressId) {
          const addressResult = await db.select()
            .from(addresses)
            .where(eq(addresses.id, order.addressId))
            .limit(1);
          addressData = addressResult[0] || null;
          console.log("💾 Order", order.id, "address:", addressData ? "found" : "not found");
        }
        
        return {
          ...order,
          items: items || [],
          address: addressData
        };
      })
    );
    
    console.log("💾 Returning orders with details:", ordersWithDetails.length);
    return ordersWithDetails;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(orderData).returning();
    return result[0];
  }

  async createOrderItems(orderId: number, items: Array<{productId: number, quantity: number, price: number}>): Promise<void> {
    console.log("💾 Creating order items for order:", orderId, "items:", items);
    
    const itemsToInsert = items.map(item => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price.toString()
    }));
    
    console.log("💾 Order items to insert:", itemsToInsert);
    
    const result = await db.insert(orderItems).values(itemsToInsert).returning();
    console.log("💾 Order items created successfully:", result.length, "items");
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    console.log("💾 Updating order status in database:", { id, status });
    try {
      const result = await db.update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();
      
      console.log("💾 Database update result:", result[0] ? "Success" : "No rows updated");
      return result[0];
    } catch (error) {
      console.error("💾 Database update error:", error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    console.log("💾 Fetching all orders with items and address for admin");
    
    // Get all orders
    const allOrders = await db.select()
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`);
    
    console.log("💾 Found orders:", allOrders.length);
    
    // For each order, fetch its items with product details and address
    const ordersWithDetails = await Promise.all(
      allOrders.map(async (order) => {
        console.log("💾 Processing admin order:", order.id);
        
        // Fetch order items with product details
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          productName: products.name,
          productImage: products.image,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));
        
        console.log("💾 Admin order", order.id, "items:", items.length);
        
        // Fetch address if addressId exists
        let addressData = null;
        if (order.addressId) {
          const addressResult = await db.select()
            .from(addresses)
            .where(eq(addresses.id, order.addressId))
            .limit(1);
          addressData = addressResult[0] || null;
          console.log("💾 Admin order", order.id, "address:", addressData ? "found" : "not found");
        }
        
        return {
          ...order,
          items: items || [],
          address: addressData
        };
      })
    );
    
    console.log("💾 Returning admin orders with details:", ordersWithDetails.length);
    return ordersWithDetails;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Product Management Methods
  async createProduct(productData: {
    name: string;
    nameRu?: string;
    nameUz?: string;
    description: string;
    descriptionRu?: string;
    descriptionUz?: string;
    price: number;
    salePrice?: number | null;
    categoryId: number;
    stockQuantity: number;
    featured: boolean;
    sale: boolean;
    image: string;
    unit: string;
    unitRu?: string;
    unitUz?: string;
    nutrition?: {
      calories: number;
      fat: number;
      carbs: number;
      protein: number;
    };
  }): Promise<Product> {
    const result = await db.insert(products).values({
      name: productData.name,
      nameRu: productData.nameRu,
      nameUz: productData.nameUz,
      description: productData.description,
      descriptionRu: productData.descriptionRu,
      descriptionUz: productData.descriptionUz,
      price: productData.price.toString(),
      salePrice: productData.salePrice?.toString(),
      categoryId: productData.categoryId,
      unit: productData.unit,
      unitRu: productData.unitRu,
      unitUz: productData.unitUz,
      inStock: productData.stockQuantity > 0,
      featured: productData.featured,
      sale: productData.sale,
      image: productData.image,
      nutrition: productData.nutrition
    }).returning();
    
    return result[0];
  }

  async updateProduct(id: number, productData: {
    name: string;
    nameRu?: string;
    nameUz?: string;
    description: string;
    descriptionRu?: string;
    descriptionUz?: string;
    price: number;
    salePrice?: number | null;
    categoryId: number;
    stockQuantity: number;
    featured: boolean;
    sale: boolean;
    image: string;
    unit: string;
    unitRu?: string;
    unitUz?: string;
    nutrition?: {
      calories: number;
      fat: number;
      carbs: number;
      protein: number;
    };
  }): Promise<Product | undefined> {
    const result = await db.update(products)
      .set({
        name: productData.name,
        nameRu: productData.nameRu,
        nameUz: productData.nameUz,
        description: productData.description,
        descriptionRu: productData.descriptionRu,
        descriptionUz: productData.descriptionUz,
        price: productData.price.toString(),
        salePrice: productData.salePrice?.toString(),
        categoryId: productData.categoryId,
        unit: productData.unit,
        unitRu: productData.unitRu,
        unitUz: productData.unitUz,
        inStock: productData.stockQuantity > 0,
        featured: productData.featured,
        sale: productData.sale,
        image: productData.image,
        nutrition: productData.nutrition,
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

  async decrementProductStock(productId: number, quantity: number): Promise<void> {
    // First get the current stock quantity
    const product = await db.select({ stockQuantity: products.stockQuantity })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    
    if (product.length === 0) {
      throw new Error("Product not found");
    }
    
    const newStockQuantity = product[0].stockQuantity - quantity;
    
    // Update the product with new stock quantity
    await db.update(products)
      .set({ 
        stockQuantity: newStockQuantity,
        inStock: newStockQuantity > 0
      })
      .where(eq(products.id, productId));
  }

  // Rider management methods
  async getAllRiders(): Promise<User[]> {
    console.log("💾 Fetching all riders from database");
    const riders = await db.select()
      .from(users)
      .where(eq(users.role, "rider"))
      .orderBy(sql`${users.createdAt} DESC`);
    
    console.log(`💾 Found ${riders.length} riders`);
    return riders;
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    console.log("💾 Creating new user:", userData.username);
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
      role: userData.role || "customer",
    }).returning();
    
    console.log("💾 User created successfully:", result[0].id);
    return result[0];
  }

  async updateUser(userId: number, updateData: any): Promise<User | undefined> {
    console.log("💾 Updating user:", userId);
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    const result = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    
    console.log("💾 User updated successfully:", userId);
    return result[0];
  }

  async deleteUser(userId: number): Promise<boolean> {
    console.log("💾 Deleting user:", userId);
    
    const result = await db.delete(users)
      .where(eq(users.id, userId))
      .returning();
    
    console.log("💾 User deleted successfully:", userId);
    return result.length > 0;
  }

  async getAvailableRiders(): Promise<User[]> {
    console.log("💾 Fetching available riders");
    
    // Get all active riders
    const riders = await db.select()
      .from(users)
      .where(and(eq(users.role, "rider"), eq(users.isActive, true)))
      .orderBy(sql`${users.createdAt} DESC`);
    
    console.log(`💾 Found ${riders.length} available riders`);
    return riders;
  }

  async assignRiderToOrder(orderId: number, riderId: number): Promise<Order | undefined> {
    console.log("💾 Assigning rider to order:", { orderId, riderId });
    
    const result = await db.update(orders)
      .set({ 
        riderAssignedId: riderId,
        riderAssignedAt: new Date(),
        status: "assigned"
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    console.log("💾 Order assigned to rider successfully:", orderId);
    return result[0];
  }

  async unsetDefaultAddresses(userId: number): Promise<void> {
    console.log("💾 Unsetting default addresses for user:", userId);
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));
    console.log("💾 Default addresses unset successfully");
  }

  // Rider-specific methods
  async getAvailableOrdersForRider(): Promise<Order[]> {
    console.log("💾 Fetching available orders for riders");
    
    // Get orders that are ready and not assigned to any rider
    const availableOrders = await db.select()
      .from(orders)
      .where(and(
        eq(orders.status, "ready"),
        sql`${orders.riderAssignedId} IS NULL`
      ))
      .orderBy(sql`${orders.createdAt} DESC`);
    
    console.log(`💾 Found ${availableOrders.length} available orders`);
    return availableOrders;
  }

  async getRiderOrders(riderId: number): Promise<any[]> {
    console.log("💾 Fetching orders for rider:", riderId);
    
    // Get orders assigned to this rider with full details
    const riderOrders = await db.select()
      .from(orders)
      .where(eq(orders.riderAssignedId, riderId))
      .orderBy(sql`${orders.createdAt} DESC`);
    
    console.log(`💾 Found ${riderOrders.length} orders for rider ${riderId}`);
    
    // Enrich orders with user, address, and items information
    const enrichedOrders = await Promise.all(
      riderOrders.map(async (order) => {
        const user = order.userId ? await this.getUser(order.userId) : null;
        const address = order.addressId ? await this.getAddress(order.addressId) : null;
        const items = await this.getOrderItems(order.id);
        
        // Get product details for each item
        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const product = await this.getProduct(item.productId);
            return {
              ...item,
              productName: product?.name || 'Unknown Product',
              productImage: product?.image || '',
              productDescription: product?.description || ''
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
    
    console.log(`💾 Returning enriched orders with details for rider ${riderId}`);
    return enrichedOrders;
  }

  async updateRiderDeliveryStatus(orderId: number, status: string): Promise<Order | undefined> {
    console.log("💾 Updating rider delivery status:", { orderId, status });
    
    const updateData: any = {};
    
    // Set appropriate timestamp based on status
    if (status === "picked_up") {
      updateData.riderPickedUpAt = new Date();
      updateData.status = "in_transit";
    } else if (status === "delivered") {
      updateData.riderDeliveredAt = new Date();
      updateData.status = "delivered";
    }
    
    const result = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    
    console.log("💾 Delivery status updated successfully:", orderId);
    return result[0];
  }

  async getRiderStats(riderId: number): Promise<any> {
    console.log("💾 Fetching rider stats for:", riderId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's deliveries
    const todayDeliveries = await db.select()
      .from(orders)
      .where(and(
        eq(orders.riderAssignedId, riderId),
        sql`${orders.createdAt} >= ${today}`,
        sql`${orders.createdAt} < ${tomorrow}`
      ));
    
    // Get completed deliveries today
    const completedToday = todayDeliveries.filter(order => order.status === "delivered");
    
    // Get pending deliveries
    const pendingDeliveries = await db.select()
      .from(orders)
      .where(and(
        eq(orders.riderAssignedId, riderId),
        sql`${orders.status} IN ('assigned', 'in_transit')`
      ));
    
    // Calculate today's earnings (assuming 19,000 сум per delivery)
    const deliveryFee = 19000;
    const todayEarnings = completedToday.length * deliveryFee;
    
    // Get this week's earnings
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekDeliveries = await db.select()
      .from(orders)
      .where(and(
        eq(orders.riderAssignedId, riderId),
        eq(orders.status, "delivered"),
        sql`${orders.createdAt} >= ${weekStart}`,
        sql`${orders.createdAt} < ${weekEnd}`
      ));
    
    const weekEarnings = weekDeliveries.length * deliveryFee;
    
    // Get this month's earnings
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    const monthDeliveries = await db.select()
      .from(orders)
      .where(and(
        eq(orders.riderAssignedId, riderId),
        eq(orders.status, "delivered"),
        sql`${orders.createdAt} >= ${monthStart}`,
        sql`${orders.createdAt} < ${monthEnd}`
      ));
    
    const monthEarnings = monthDeliveries.length * deliveryFee;
    
    const stats = {
      todayDeliveries: todayDeliveries.length,
      completedToday: completedToday.length,
      pendingDeliveries: pendingDeliveries.length,
      todayEarnings,
      weekEarnings,
      monthEarnings
    };
    
    console.log("💾 Rider stats calculated:", stats);
    return stats;
  }

  // Review Management Methods
  async getProductReviews(productId: number) {
    return await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      with: {
        user: true
      },
      orderBy: desc(reviews.createdAt)
    });
  }

  async createReview(reviewData: InsertReview) {
    const result = await db.insert(reviews).values(reviewData).returning();
    return result[0];
  }
}

// Export the database storage instance
export const storage = new DatabaseStorage();

// Password verification utility
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
