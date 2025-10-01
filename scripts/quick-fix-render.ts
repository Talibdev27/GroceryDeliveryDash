import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// Load environment variables
config();

async function quickFixRender() {
  console.log("🚀 Starting quick fix for Render database...");
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    // First, let's check what columns exist
    console.log("🔍 Checking current table structure...");
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `);
    
    console.log("Current columns:", columns.rows);

    // Add missing columns one by one
    const missingColumns = [
      { name: 'stock_quantity', type: 'INTEGER NOT NULL DEFAULT 0' },
      { name: 'name_es', type: 'TEXT' },
      { name: 'name_ar', type: 'TEXT' },
      { name: 'description_es', type: 'TEXT' },
      { name: 'description_ar', type: 'TEXT' },
      { name: 'unit_es', type: 'TEXT' },
      { name: 'unit_ar', type: 'TEXT' },
      { name: 'sale_price', type: 'DECIMAL(10,2)' },
      { name: 'nutrition', type: 'JSON' },
      { name: 'allergens', type: 'JSON' }
    ];

    for (const column of missingColumns) {
      try {
        console.log(`➕ Adding column: ${column.name}`);
        await db.execute(sql.raw(`
          ALTER TABLE products 
          ADD COLUMN ${column.name} ${column.type}
        `));
        console.log(`✅ Added ${column.name} successfully`);
      } catch (error: any) {
        if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
          console.log(`ℹ️  Column ${column.name} already exists`);
        } else {
          console.error(`❌ Error adding ${column.name}:`, error.message);
        }
      }
    }

    // Verify the fix
    console.log("🔍 Verifying table structure after fix...");
    const updatedColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `);
    
    console.log("Updated columns:", updatedColumns.rows);
    console.log("🎉 Quick fix completed successfully!");

  } catch (error) {
    console.error("❌ Error in quick fix:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  quickFixRender();
}
