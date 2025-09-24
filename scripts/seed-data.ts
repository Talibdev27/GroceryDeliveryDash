import { config } from "dotenv";
import { db } from "../server/storage";
import { categories, products } from "../shared/schema";
import { categories as mockCategories } from "../client/src/data/categories";
import { products as mockProducts } from "../client/src/data/products";

// Load environment variables
config();

async function seedCategories() {
  console.log("Seeding categories...");
  
  for (const category of mockCategories) {
    try {
      await db.insert(categories).values({
        name: category.name,
        nameEs: category.nameEs,
        nameAr: category.nameAr,
        image: category.image,
        slug: category.slug,
        isActive: true,
      });
      console.log(`✓ Added category: ${category.name}`);
    } catch (error) {
      console.log(`⚠ Category ${category.name} might already exist`);
    }
  }
}

async function seedProducts() {
  console.log("Seeding products...");
  
  // First, get all categories to map them to products
  const dbCategories = await db.select().from(categories);
  const categoryMap = new Map();
  dbCategories.forEach(cat => {
    categoryMap.set(cat.name, cat.id);
  });

  for (const product of mockProducts) {
    try {
      const categoryId = categoryMap.get(product.category.name);
      
      if (!categoryId) {
        console.log(`⚠ Skipping product ${product.name} - category not found`);
        continue;
      }

      await db.insert(products).values({
        name: product.name,
        nameEs: product.nameEs,
        nameAr: product.nameAr,
        description: product.description,
        descriptionEs: product.descriptionEs,
        descriptionAr: product.descriptionAr,
        price: product.price.toString(),
        image: product.image,
        categoryId: categoryId,
        unit: product.unit,
        unitEs: product.unitEs,
        unitAr: product.unitAr,
        inStock: product.inStock,
        featured: product.featured || false,
        sale: product.sale || false,
        salePrice: product.salePrice?.toString(),
        nutrition: product.nutrition,
        allergens: product.allergens,
      });
      console.log(`✓ Added product: ${product.name}`);
    } catch (error) {
      console.log(`⚠ Product ${product.name} might already exist`);
    }
  }
}

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    await seedCategories();
    await seedProducts();
    
    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
