import { config } from "dotenv";
import { Pool } from "pg";

config();

/**
 * Script to add Canned Goods, Spices, and Sauces categories to the database.
 * These categories are defined in client/src/data/categories.ts but may not exist in the database.
 * 
 * Usage:
 *   npx tsx scripts/add-condiment-categories.ts
 * 
 * Environment variables:
 *   DATABASE_URL - PostgreSQL connection string (required)
 */

const newCategories = [
  {
    name: 'Canned Goods',
    nameEs: 'Conservas',
    nameAr: 'معلبات',
    nameRu: 'Консервы',
    nameUz: 'Kanservantlar',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'kanservantlar'
  },
  {
    name: 'Spices',
    nameEs: 'Especias',
    nameAr: 'بهارات',
    nameRu: 'Специи',
    nameUz: 'Ziravorlar',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'ziravorlar'
  },
  {
    name: 'Sauces',
    nameEs: 'Salsas',
    nameAr: 'صلصات',
    nameRu: 'Соусы',
    nameUz: 'Souslar',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'souslar'
  }
];

async function addCondimentCategories() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required. Please set it in your .env file or environment.");
  }

  console.log(`🛍️ Adding ${newCategories.length} condiment categories to database...`);
  console.log(`📊 Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const category of newCategories) {
      // Check if category already exists by slug
      const existingCheck = await pool.query(
        'SELECT id, slug, is_active FROM categories WHERE slug = $1',
        [category.slug]
      );

      if (existingCheck.rows.length > 0) {
        const existing = existingCheck.rows[0];
        
        // If exists but inactive, activate it and update fields
        if (!existing.is_active) {
          await pool.query(`
            UPDATE categories 
            SET name = $1, name_es = $2, name_ar = $3, name_ru = $4, name_uz = $5, 
                image = $6, is_active = true
            WHERE slug = $7
          `, [
            category.name,
            category.nameEs,
            category.nameAr,
            category.nameRu,
            category.nameUz,
            category.image,
            category.slug
          ]);
          console.log(`✅ Activated and updated category: ${category.name} (${category.nameUz})`);
          updatedCount++;
        } else {
          // Already exists and is active, just update fields in case they changed
          await pool.query(`
            UPDATE categories 
            SET name = $1, name_es = $2, name_ar = $3, name_ru = $4, name_uz = $5, image = $6
            WHERE slug = $7
          `, [
            category.name,
            category.nameEs,
            category.nameAr,
            category.nameRu,
            category.nameUz,
            category.image,
            category.slug
          ]);
          console.log(`ℹ️  Category already exists (active): ${category.name} (${category.nameUz}) - updated fields`);
          skippedCount++;
        }
      } else {
        // Category doesn't exist, insert it
        await pool.query(`
          INSERT INTO categories (name, name_es, name_ar, name_ru, name_uz, image, slug, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        `, [
          category.name,
          category.nameEs,
          category.nameAr,
          category.nameRu,
          category.nameUz,
          category.image,
          category.slug
        ]);
        console.log(`✅ Added new category: ${category.name} (${category.nameUz})`);
        addedCount++;
      }
    }
    
    console.log(`\n🎉 Category migration completed!`);
    console.log(`   Added: ${addedCount}`);
    console.log(`   Updated/Activated: ${updatedCount}`);
    console.log(`   Already exists: ${skippedCount}`);
    console.log(`\n📋 Categories processed:`);
    newCategories.forEach(cat => {
      console.log(`   - ${cat.name} / ${cat.nameUz} / ${cat.nameRu} (slug: ${cat.slug})`);
    });
    
  } catch (error) {
    console.error("❌ Error adding categories:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addCondimentCategories()
    .then(() => {
      console.log("\n✅ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

export { addCondimentCategories };


