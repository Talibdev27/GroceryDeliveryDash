import { config } from "dotenv";
import { Pool } from "pg";

config();

async function addCategoryTranslations() {
  console.log("🌍 Adding Russian and Uzbek translation columns to categories table...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(`
      ALTER TABLE categories
      ADD COLUMN name_ru TEXT,
      ADD COLUMN name_uz TEXT;
    `);
    console.log("✅ Added name_ru and name_uz columns to categories table.");
  } catch (error: any) {
    if (error.code === '42701') { // column already exists
      console.log("✅ name_ru and name_uz columns already exist.");
    } else {
      console.error("❌ Error adding translation columns:", error);
      throw error;
    }
  } finally {
    await pool.end();
  }
  console.log("🎉 Category translation columns added successfully!");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  addCategoryTranslations()
    .then(() => {
      console.log("\n✅ Category translation migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Category translation migration failed:", error);
      process.exit(1);
    });
}

export { addCategoryTranslations };
