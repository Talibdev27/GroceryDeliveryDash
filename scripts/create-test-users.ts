import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

// Load environment variables
config();

async function createTestUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    // Create Admin user
    const adminData = {
      username: "admin",
      email: "admin@diyormarket.com",
      password: await bcrypt.hash("Admin123!", 10),
      firstName: "Store",
      lastName: "Admin",
      role: "admin" as const,
      permissions: [
        "manage_products",
        "manage_orders",
        "view_analytics",
        "manage_settings"
      ],
      isActive: true
    };

    // Create Customer user
    const customerData = {
      username: "customer",
      email: "customer@diyormarket.com",
      password: await bcrypt.hash("Customer123!", 10),
      firstName: "John",
      lastName: "Doe",
      role: "customer" as const,
      isActive: true
    };

    // Create Rider user
    const riderData = {
      username: "rider",
      email: "rider@diyormarket.com",
      password: await bcrypt.hash("Rider123!", 10),
      firstName: "Delivery",
      lastName: "Rider",
      role: "rider" as const,
      isActive: true
    };

    // Insert users
    await db.insert(users).values([adminData, customerData, riderData]);
    
    console.log("✅ Test users created successfully!");
    console.log("\n📋 Test Account Credentials:");
    console.log("┌─────────────────────────────────────────────────┐");
    console.log("│ ROLE        │ USERNAME │ EMAIL                    │ PASSWORD      │");
    console.log("├─────────────────────────────────────────────────┤");
    console.log("│ Super Admin │ superadmin │ superadmin@diyormarket.com │ SuperAdmin123! │");
    console.log("│ Admin       │ admin      │ admin@diyormarket.com      │ Admin123!      │");
    console.log("│ Customer    │ customer   │ customer@diyormarket.com   │ Customer123!   │");
    console.log("│ Rider       │ rider      │ rider@diyormarket.com       │ Rider123!      │");
    console.log("└─────────────────────────────────────────────────┘");
    console.log("\n🌐 Access URLs:");
    console.log("• Super Admin Dashboard: http://localhost:4000/super-admin");
    console.log("• Admin Dashboard: http://localhost:4000/admin");
    console.log("• Customer Account: http://localhost:4000/account");
    console.log("• Rider Dashboard: http://localhost:4000/rider");

  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUsers();
}
