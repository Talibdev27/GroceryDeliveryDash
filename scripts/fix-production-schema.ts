import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// Load environment variables
config();

async function fixProductionSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log("🔧 Fixing production database schema...");
    
    // Check if stock_quantity column exists
    const checkColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'stock_quantity'
    `);

    if (checkColumn.rows.length === 0) {
      console.log("➕ Adding missing stock_quantity column...");
      await db.execute(sql`
        ALTER TABLE products 
        ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0
      `);
      console.log("✅ stock_quantity column added successfully!");
    } else {
      console.log("✅ stock_quantity column already exists");
    }

    // Check if other missing columns exist and add them
    const checkColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('name_es', 'name_ar', 'description_es', 'description_ar', 'unit_es', 'unit_ar', 'sale_price', 'nutrition', 'allergens')
    `);

    const existingColumns = checkColumns.rows.map((row: any) => row.column_name);
    const missingColumns = [
      'name_es', 'name_ar', 'description_es', 'description_ar', 
      'unit_es', 'unit_ar', 'sale_price', 'nutrition', 'allergens'
    ].filter(col => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      console.log(`➕ Adding missing columns: ${missingColumns.join(', ')}`);
      
      for (const column of missingColumns) {
        let columnType = 'TEXT';
        if (column === 'sale_price') columnType = 'DECIMAL(10,2)';
        if (column === 'nutrition' || column === 'allergens') columnType = 'JSON';
        
        await db.execute(sql.raw(`
          ALTER TABLE products 
          ADD COLUMN ${column} ${columnType}
        `));
      }
      console.log("✅ All missing columns added successfully!");
    } else {
      console.log("✅ All required columns already exist");
    }

    console.log("🎉 Production database schema fixed successfully!");

  } catch (error) {
    console.error("❌ Error fixing production schema:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  fixProductionSchema();
}
