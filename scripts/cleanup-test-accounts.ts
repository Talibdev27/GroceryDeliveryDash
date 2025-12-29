import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

// Load environment variables
config();

const testEmails = [
  'admin@diyormarket.com',
  'customer@diyormarket.com',
  'rider@diyormarket.com',
  'superadmin@diyormarket.com'
];

const testUsernames = [
  'admin',
  'customer',
  'rider',
  'superadmin'
];

async function cleanupTestAccounts() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log("🔒 TEST ACCOUNT CLEANUP - Diyor Market\n");
    console.log("=".repeat(60));
    
    // Find test accounts
    console.log("\n🔍 Finding test accounts...");
    const testAccounts = await db
      .select()
      .from(users)
      .where(inArray(users.email, testEmails));
    
    if (testAccounts.length === 0) {
      console.log("✅ No test accounts found. Nothing to clean up.");
      return;
    }
    
    console.log(`\n⚠️  Found ${testAccounts.length} test accounts:`);
    testAccounts.forEach(account => {
      console.log(`   - ${account.username} (${account.email}) - Role: ${account.role} - Active: ${account.isActive}`);
    });
    
    // Deactivate accounts (safer than deletion - preserves audit trail)
    console.log("\n🔒 Deactivating test accounts...");
    const result = await db
      .update(users)
      .set({ isActive: false })
      .where(inArray(users.email, testEmails))
      .returning();
    
    console.log(`\n✅ Successfully deactivated ${result.length} test accounts:`);
    result.forEach(account => {
      console.log(`   - ${account.username} (${account.email})`);
    });
    
    console.log("\n💡 Note: Accounts are deactivated, not deleted.");
    console.log("   This preserves audit trail while preventing login.");
    console.log("   To permanently delete, run with --delete flag.");
    
    console.log("\n✅ Cleanup complete!");
    console.log("=".repeat(60));
    
  } catch (error: any) {
    console.error("❌ Cleanup error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check for --delete flag
const shouldDelete = process.argv.includes('--delete');

if (shouldDelete) {
  console.log("⚠️  DELETE MODE: Accounts will be permanently deleted!");
  console.log("   This action cannot be undone.\n");
  
  // For deletion, we'd need to handle foreign key constraints
  // For now, deactivation is safer
  console.log("   Deletion not implemented - use deactivation instead.");
  console.log("   If you need deletion, do it manually via database.\n");
}

// Run the cleanup
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupTestAccounts();
}

