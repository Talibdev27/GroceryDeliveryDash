import { config } from "dotenv";
import { db } from "../server/storage";
import { categories } from "../shared/schema";
import { categories as mockCategories } from "../client/src/data/categories";
import { eq } from "drizzle-orm";

config();

async function updateCategoryTranslations() {
  console.log("🌍 Updating category translations in database...");

  try {
    const dbCategories = await db.select().from(categories);
    let updatedCount = 0;

    for (const mockCategory of mockCategories) {
      const dbCategory = dbCategories.find(cat => cat.slug === mockCategory.slug);

      if (dbCategory) {
        console.log(`🔄 Updating ${mockCategory.name} translations:`);
        console.log(`   Russian: ${mockCategory.nameRu}`);
        console.log(`   Uzbek: ${mockCategory.nameUz}`);
        
        await db.update(categories)
          .set({ 
            nameRu: mockCategory.nameRu,
            nameUz: mockCategory.nameUz
          })
          .where(eq(categories.id, dbCategory.id));
        
        console.log(`✅ Updated ${mockCategory.name} translations successfully`);
        updatedCount++;
      }
    }

    console.log(`🎉 Category translations update completed! Updated ${updatedCount} categories.`);

    // Verification step
    console.log("\n📋 Verifying updated categories:");
    const verifiedCategories = await db.select().from(categories);
    verifiedCategories.forEach(cat => {
      console.log(`   ${cat.name}: RU="${cat.nameRu}", UZ="${cat.nameUz}"`);
    });

  } catch (error) {
    console.error("❌ Error updating category translations:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  updateCategoryTranslations()
    .then(() => {
      console.log("\n✅ Category translations update completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Category translations update failed:", error);
      process.exit(1);
    });
}

export { updateCategoryTranslations };
