import { config } from "dotenv";
import { Pool } from "pg";

config();

async function addProductTranslations() {
  console.log("🌍 Adding Russian and Uzbek translation columns to products table...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN name_ru TEXT,
      ADD COLUMN name_uz TEXT,
      ADD COLUMN description_ru TEXT,
      ADD COLUMN description_uz TEXT,
      ADD COLUMN unit_ru TEXT,
      ADD COLUMN unit_uz TEXT;
    `);
    console.log("✅ Added name_ru, name_uz, description_ru, description_uz, unit_ru, unit_uz columns to products table.");
  } catch (error: any) {
    if (error.code === '42701') { // column already exists
      console.log("✅ Product translation columns already exist.");
    } else {
      console.error("❌ Error adding product translation columns:", error);
      throw error;
    }
  } finally {
    await pool.end();
  }
  console.log("🎉 Product translation columns added successfully!");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  addProductTranslations()
    .then(() => {
      console.log("\n✅ Product translation migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Product translation migration failed:", error);
      process.exit(1);
    });
}

export { addProductTranslations };
