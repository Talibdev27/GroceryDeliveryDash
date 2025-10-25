import { config } from "dotenv";
import { Pool } from "pg";

config();

async function translateExistingProducts() {
  console.log("🌍 Translating existing products to support multi-language...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Get all existing products
    const result = await pool.query("SELECT id, name, description, unit FROM products");
    const existingProducts = result.rows;
    console.log(`📦 Found ${existingProducts.length} products to translate`);
    
    let translatedCount = 0;
    let errorCount = 0;
    
    for (const product of existingProducts) {
      try {
        console.log(`\n🔄 Translating product: "${product.name}"`);
        
        // For existing products, we'll treat the current name/description as English
        // and translate to Uzbek and Russian
        const translations = await translateProduct(product.name, product.description, product.unit || "шт");
        
        // Update the product with translations
        await pool.query(`
          UPDATE products 
          SET 
            name_uz = $1,
            description_uz = $2,
            unit_uz = $3,
            name_ru = $4,
            description_ru = $5,
            unit_ru = $6
          WHERE id = $7
        `, [
          translations.nameUz,
          translations.descriptionUz,
          translations.unitUz,
          translations.nameRu,
          translations.descriptionRu,
          translations.unitRu,
          product.id
        ]);
        
        console.log(`✅ Translated: "${product.name}" → "${translations.nameUz}" (UZ), "${translations.nameRu}" (RU)`);
        translatedCount++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error translating product ${product.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Translation completed!`);
    console.log(`✅ Successfully translated: ${translatedCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    
  } catch (error) {
    console.error("❌ Translation script failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function translateProduct(name: string, description: string, unit: string) {
  try {
    // Translate from English to Uzbek
    const [nameUzResult, descriptionUzResult, unitUzResult] = await Promise.all([
      translateText(name, 'en', 'uz'),
      translateText(description, 'en', 'uz'),
      translateText(unit, 'en', 'uz')
    ]);
    
    // Translate from English to Russian
    const [nameRuResult, descriptionRuResult, unitRuResult] = await Promise.all([
      translateText(name, 'en', 'ru'),
      translateText(description, 'en', 'ru'),
      translateText(unit, 'en', 'ru')
    ]);
    
    return {
      nameUz: nameUzResult.translatedText,
      descriptionUz: descriptionUzResult.translatedText,
      unitUz: unitUzResult.translatedText,
      nameRu: nameRuResult.translatedText,
      descriptionRu: descriptionRuResult.translatedText,
      unitRu: unitRuResult.translatedText
    };
    
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text if translation fails
    return {
      nameUz: name,
      descriptionUz: description,
      unitUz: unit,
      nameRu: name,
      descriptionRu: description,
      unitRu: unit
    };
  }
}

async function translateText(text: string, from: string, to: string): Promise<{translatedText: string, success: boolean}> {
  try {
    if (!text || text.trim().length === 0) {
      return { translatedText: text, success: true };
    }

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    
    console.log(`🌍 Translating: "${text}" from ${from} to ${to}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      const translatedText = data.responseData.translatedText;
      console.log(`✅ Result: "${translatedText}"`);
      
      return {
        translatedText: translatedText,
        success: true
      };
    } else {
      throw new Error(`Translation API error: ${data.responseStatus}`);
    }
    
  } catch (error) {
    console.error('❌ Translation error:', error);
    return {
      translatedText: text, // Return original text if translation fails
      success: false
    };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  translateExistingProducts()
    .then(() => {
      console.log("\n✅ Product translation completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Product translation failed:", error);
      process.exit(1);
    });
}

export { translateExistingProducts };
