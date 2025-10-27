import { config } from "dotenv";
import { Pool } from "pg";

config();

async function fixCerealImage() {
  console.log("🌾 Fixing Cereal category image...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  const newImageUrl = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200';
  
  try {
    const result = await pool.query(`
      UPDATE categories 
      SET image = $1 
      WHERE slug = 'cereal'
    `, [newImageUrl]);
    
    if (result.rowCount && result.rowCount > 0) {
      console.log('✅ Cereal category image updated successfully!');
      console.log(`New image URL: ${newImageUrl}`);
    } else {
      console.log('⚠️ No rows updated - cereal category might not exist');
    }
  } catch (error) {
    console.error('❌ Error updating cereal image:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixCerealImage()
    .then(() => {
      console.log("\n✅ Cereal image fix completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Cereal image fix failed:", error);
      process.exit(1);
    });
}

export { fixCerealImage };
