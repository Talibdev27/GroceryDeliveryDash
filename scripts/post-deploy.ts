import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// Load environment variables
config();

async function postDeploy() {
  console.log("🚀 Running post-deployment database fix...");
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    // Check if stock_quantity exists
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'stock_quantity'
    `);

    if (checkResult.rows.length === 0) {
      console.log("🔧 Adding missing stock_quantity column...");
      await db.execute(sql`
        ALTER TABLE products 
        ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0
      `);
      console.log("✅ stock_quantity column added!");
    } else {
      console.log("✅ stock_quantity column already exists");
    }

    // Add other missing columns if needed
    const otherColumns = [
      'name_es', 'name_ar', 'description_es', 'description_ar',
      'unit_es', 'unit_ar', 'sale_price', 'nutrition', 'allergens'
    ];

    for (const columnName of otherColumns) {
      const check = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = ${columnName}
      `);

      if (check.rows.length === 0) {
        let columnType = 'TEXT';
        if (columnName === 'sale_price') columnType = 'DECIMAL(10,2)';
        if (columnName === 'nutrition' || columnName === 'allergens') columnType = 'JSON';
        
        await db.execute(sql.raw(`
          ALTER TABLE products 
          ADD COLUMN ${columnName} ${columnType}
        `));
        console.log(`✅ Added ${columnName} column`);
      }
    }

    console.log("🎉 Post-deployment fix completed!");

  } catch (error) {
    console.error("❌ Post-deployment error:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  postDeploy();
}
