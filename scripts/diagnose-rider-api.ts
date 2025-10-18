import { config } from "dotenv";
config();

async function diagnoseRiderAPI() {
  console.log("🔍 Diagnosing Rider Management API...\n");
  
  // Test 1: Check server is running
  console.log("1️⃣ Testing server connection...");
  try {
    const response = await fetch("http://localhost:4000/");
    console.log(`✅ Server responding: ${response.status}`);
  } catch (error) {
    console.error("❌ Server not reachable:", error.message);
    return;
  }
  
  // Test 2: Check API endpoint without auth
  console.log("\n2️⃣ Testing /api/admin/riders without authentication...");
  try {
    const response = await fetch("http://localhost:4000/api/admin/riders");
    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    const data = await response.text();
    console.log("Response body:", data);
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
  
  // Test 3: Test database rider query
  console.log("\n3️⃣ Testing database rider query...");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { Pool } = await import("pg");
  const { sql } = await import("drizzle-orm");
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    const riders = await db.execute(sql`
      SELECT id, username, email, first_name, last_name, role, is_active
      FROM users 
      WHERE role = 'rider'
    `);
    console.log(`✅ Database query successful: ${riders.rows.length} riders found`);
    riders.rows.forEach((r: any) => {
      console.log(`  - ${r.first_name} ${r.last_name} (${r.username})`);
    });
  } catch (error) {
    console.error("❌ Database query failed:", error.message);
  }
  
  await pool.end();
  
  console.log("\n✅ Diagnosis complete!");
}

diagnoseRiderAPI();
