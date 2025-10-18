import { config } from "dotenv";
import { db } from "../server/storage";
import { categories } from "../shared/schema";
import { categories as mockCategories } from "../client/src/data/categories";
import { eq } from "drizzle-orm";

// Load environment variables
config();

async function fixCategoryImages() {
  console.log("🔧 Fixing category images with correct Unsplash URLs...");
  
  try {
    // Get all categories from database
    const dbCategories = await db.select().from(categories);
    console.log(`📋 Found ${dbCategories.length} categories in database`);
    
    // Create a map of mock categories by slug for easy lookup
    const mockCategoryMap = new Map();
    mockCategories.forEach(cat => {
      mockCategoryMap.set(cat.slug, cat);
    });
    
    let updatedCount = 0;
    
    for (const dbCategory of dbCategories) {
      const mockCategory = mockCategoryMap.get(dbCategory.slug);
      
      if (!mockCategory) {
        console.log(`⚠️  No mock data found for category: ${dbCategory.name} (slug: ${dbCategory.slug})`);
        continue;
      }
      
      // Check if the image URL is different
      if (dbCategory.image !== mockCategory.image) {
        console.log(`🔄 Updating ${dbCategory.name}:`);
        console.log(`   Old: ${dbCategory.image}`);
        console.log(`   New: ${mockCategory.image}`);
        
        // Update the category image in database
        await db.update(categories)
          .set({ image: mockCategory.image })
          .where(eq(categories.id, dbCategory.id));
        
        updatedCount++;
        console.log(`✅ Updated ${dbCategory.name} successfully`);
      } else {
        console.log(`✅ ${dbCategory.name} already has correct image URL`);
      }
    }
    
    console.log(`🎉 Category image fix completed! Updated ${updatedCount} categories.`);
    
    // Verify the fix by fetching updated categories
    console.log("\n📋 Verifying updated categories:");
    const updatedCategories = await db.select().from(categories);
    updatedCategories.forEach(cat => {
      console.log(`   ${cat.name}: ${cat.image}`);
    });
    
  } catch (error) {
    console.error("❌ Error fixing category images:", error);
    process.exit(1);
  }
}

// Run the fix if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixCategoryImages();
}

export { fixCategoryImages };
