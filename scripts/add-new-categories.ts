import { config } from "dotenv";
import { Pool } from "pg";

config();

const newCategories = [
  {
    name: 'Beverages',
    nameEs: 'Bebidas',
    nameAr: 'مشروبات',
    nameRu: 'Напитки',
    nameUz: 'Ichimliklar',
    image: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'beverages'
  },
  {
    name: 'Baby Care',
    nameEs: 'Cuidado del Bebé',
    nameAr: 'رعاية الطفل',
    nameRu: 'Детские товары',
    nameUz: 'Bolalar parvarishi',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'baby-care'
  },
  {
    name: 'Personal Care & Health',
    nameEs: 'Cuidado Personal y Salud',
    nameAr: 'العناية الشخصية والصحة',
    nameRu: 'Личная гигиена и здоровье',
    nameUz: 'Shaxsiy parvarish va salomatlik',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'personal-care'
  },
  {
    name: 'Household & Cleaning',
    nameEs: 'Hogar y Limpieza',
    nameAr: 'المنزل والتنظيف',
    nameRu: 'Товары для дома и уборки',
    nameUz: 'Uy va tozalash',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'household-cleaning'
  },
  {
    name: 'Pet Care',
    nameEs: 'Cuidado de Mascotas',
    nameAr: 'رعاية الحيوانات الأليفة',
    nameRu: 'Товары для животных',
    nameUz: 'Uy hayvonlari parvarishi',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'pet-care'
  },
  {
    name: 'Cereal',
    nameEs: 'Cereales',
    nameAr: 'حبوب',
    nameRu: 'Крупы',
    nameUz: 'Donli mahsulotlar',
    image: 'https://images.unsplash.com/photo-1574687969693-85f2f9b1e16c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'cereal'
  },
  {
    name: 'Oils & Fats',
    nameEs: 'Aceites y Grasas',
    nameAr: 'زيوت ودهون',
    nameRu: 'Масла и жиры',
    nameUz: "Yog'lar va o'simlik yog'lari",
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
    slug: 'oils-fats'
  }
];

async function addNewCategories() {
  console.log("🛍️ Adding 7 new product categories to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    for (const category of newCategories) {
      await pool.query(`
        INSERT INTO categories (name, name_es, name_ar, name_ru, name_uz, image, slug, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          name_es = EXCLUDED.name_es,
          name_ar = EXCLUDED.name_ar,
          name_ru = EXCLUDED.name_ru,
          name_uz = EXCLUDED.name_uz,
          image = EXCLUDED.image
      `, [
        category.name,
        category.nameEs,
        category.nameAr,
        category.nameRu,
        category.nameUz,
        category.image,
        category.slug
      ]);
      console.log(`✅ Added/Updated category: ${category.name} (${category.nameUz})`);
    }
    
    console.log(`\n🎉 Successfully added/updated ${newCategories.length} categories!`);
    console.log("Categories added:");
    newCategories.forEach(cat => {
      console.log(`  - ${cat.name} / ${cat.nameUz} / ${cat.nameRu}`);
    });
    
  } catch (error) {
    console.error("❌ Error adding categories:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  addNewCategories()
    .then(() => {
      console.log("\n✅ Category addition completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Category addition failed:", error);
      process.exit(1);
    });
}

export { addNewCategories };
