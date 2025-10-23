import { config } from "dotenv";
import { db } from "../server/storage";
import { sql } from "drizzle-orm";

config();

async function addCoordinatesToAddresses() {
  console.log("🗺️ Adding latitude and longitude columns to addresses table...");

  try {
    // Add latitude column
    await db.execute(sql`
      ALTER TABLE addresses 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8)
    `);
    console.log("✅ Added latitude column");

    // Add longitude column
    await db.execute(sql`
      ALTER TABLE addresses 
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8)
    `);
    console.log("✅ Added longitude column");

    console.log("🎉 Coordinates columns added successfully!");
    
    // Verify the columns exist
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'addresses' 
      AND column_name IN ('latitude', 'longitude')
    `);
    
    console.log("📋 Verification - Coordinate columns:");
    console.log(result.rows);
    
  } catch (error) {
    console.error("❌ Error adding coordinate columns:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  addCoordinatesToAddresses()
    .then(() => {
      console.log("✅ Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}

export { addCoordinatesToAddresses };
