import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";
import { categories } from "../shared/schema";
import { eq } from "drizzle-orm";

config();

async function fixBeveragesImage() {
  console.log("🥤 Updating Beverages category image to non-alcoholic drink...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const newImageUrl = 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200';
  const beveragesSlug = 'beverages';

  try {
    const result = await db.update(categories)
      .set({ image: newImageUrl })
      .where(eq(categories.slug, beveragesSlug))
      .returning();

    if (result.length > 0) {
      console.log(`✅ Beverages category image updated successfully!`);
      console.log(`New image URL: ${newImageUrl}`);
    } else {
      console.log(`⚠️ Beverages category with slug '${beveragesSlug}' not found.`);
    }
  } catch (error) {
    console.error("❌ Error updating Beverages category image:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixBeveragesImage()
  .then(() => console.log("\n✅ Beverages image update completed successfully!"))
  .catch((err) => console.error("\n❌ Beverages image update failed:", err));
