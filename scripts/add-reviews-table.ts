import { Pool } from "pg";
import { config } from "dotenv";

config();

async function addReviewsTable() {
  console.log("📝 Creating reviews table...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title TEXT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
    `);
    
    console.log("✅ Reviews table created successfully!");
  } catch (error) {
    console.error("❌ Error creating reviews table:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

addReviewsTable()
  .then(() => console.log("\n✅ Reviews table migration completed successfully!"))
  .catch((err) => console.error("\n❌ Reviews table migration failed:", err));
