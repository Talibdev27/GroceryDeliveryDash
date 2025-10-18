import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// Load environment variables
config();

async function checkRiderSchema() {
  console.log("🔍 Checking Rider Management Database Schema...\n");

  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    // Check if rider-related columns exist in orders table
    console.log("📋 Checking orders table for rider columns...");
    const riderColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name LIKE '%rider%'
      ORDER BY column_name
    `);

    console.log("Rider-related columns in orders table:");
    if (riderColumns.rows.length === 0) {
      console.log("❌ No rider columns found in orders table");
      console.log("   This means the schema changes haven't been applied yet.");
    } else {
      riderColumns.rows.forEach((row: any) => {
        console.log(`  ✅ ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

    // Check if users table has role column
    console.log("\n📋 Checking users table for role column...");
    const roleColumn = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'role'
    `);

    if (roleColumn.rows.length === 0) {
      console.log("❌ No 'role' column found in users table");
    } else {
      console.log("✅ 'role' column exists in users table");
    }

    // Test if we can fetch riders
    console.log("\n🔍 Testing rider fetching...");
    try {
      const riders = await db.execute(sql`
        SELECT id, username, email, first_name, last_name, role, is_active
        FROM users 
        WHERE role = 'rider'
        ORDER BY created_at DESC
      `);
      
      console.log(`✅ Found ${riders.rows.length} riders in database`);
      riders.rows.forEach((rider: any) => {
        console.log(`  - ${rider.first_name} ${rider.last_name} (${rider.username}) - ${rider.is_active ? 'Active' : 'Inactive'}`);
      });
    } catch (error: any) {
      console.log("❌ Error fetching riders:", error.message);
    }

    // Check if the API endpoint would work
    console.log("\n🔍 Testing API endpoint simulation...");
    try {
      const testRiders = await db.execute(sql`
        SELECT id, username, email, first_name, last_name, phone, is_active, created_at
        FROM users 
        WHERE role = 'rider'
        ORDER BY created_at DESC
      `);
      
      console.log(`✅ API simulation successful - would return ${testRiders.rows.length} riders`);
    } catch (error: any) {
      console.log("❌ API simulation failed:", error.message);
    }

  } catch (error: any) {
    console.error("❌ Database connection error:", error.message);
  } finally {
    await pool.end();
  }
}

checkRiderSchema();
