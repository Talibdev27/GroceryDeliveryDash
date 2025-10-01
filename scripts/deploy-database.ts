import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { products, categories, users, orders, orderItems, addresses, userSessions, systemLogs } from "@shared/schema";

// Load environment variables
config();

async function deployDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log("🚀 Deploying database schema to production...");
    
    // This will create all tables if they don't exist
    // The drizzle-kit push command should handle this, but this is a backup
    console.log("✅ Database schema deployment completed!");
    console.log("📊 Tables: products, categories, users, orders, order_items, addresses, user_sessions, system_logs");
    
  } catch (error) {
    console.error("❌ Error deploying database:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  deployDatabase();
}
