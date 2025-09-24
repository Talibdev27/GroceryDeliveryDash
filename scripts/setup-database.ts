#!/usr/bin/env tsx

import { db } from "../server/storage";
import { seedDatabase } from "./seed-data";

async function setupDatabase() {
  try {
    console.log("🚀 Setting up FreshCart database...");
    
    // Test database connection
    console.log("📡 Testing database connection...");
    await db.execute("SELECT 1");
    console.log("✅ Database connection successful!");
    
    // Run database migrations (this will be handled by drizzle-kit)
    console.log("📋 Running database migrations...");
    console.log("⚠️  Please run 'npm run db:push' to apply schema changes");
    
    // Seed initial data
    console.log("🌱 Seeding initial data...");
    await seedDatabase();
    
    console.log("🎉 Database setup completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Run 'npm run db:push' to apply schema changes");
    console.log("2. Start the development server with 'npm run dev'");
    console.log("3. Test the API endpoints");
    
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    console.log("\nTroubleshooting:");
    console.log("1. Make sure DATABASE_URL is set in your environment");
    console.log("2. Ensure your database is running and accessible");
    console.log("3. Check your database credentials");
    process.exit(1);
  }
}

setupDatabase();
