import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// Load environment variables
config();

async function autoFixDatabase() {
  console.log("🔧 Auto-fixing database on startup...");
  
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
      console.log("➕ Adding missing stock_quantity column...");
      await db.execute(sql`
        ALTER TABLE products 
        ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0
      `);
      console.log("✅ stock_quantity column added!");
    } else {
      console.log("✅ stock_quantity column already exists");
    }

    // Add other missing columns
    const otherColumns = [
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

    for (const column of otherColumns) {
      const check = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = ${column.name}
      `);

      if (check.rows.length === 0) {
        await db.execute(sql.raw(`
          ALTER TABLE products 
          ADD COLUMN ${column.name} ${column.type}
        `));
        console.log(`✅ Added ${column.name} column`);
      }
    }

    console.log("🎉 Database auto-fix completed!");

  } catch (error) {
    console.error("❌ Auto-fix error:", error);
  } finally {
    await pool.end();
  }
}

export { autoFixDatabase };


