import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "@shared/schema";
import { eq, sql, desc, or, like } from "drizzle-orm";

// Load environment variables
config();

async function securityAudit() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log("🔒 SECURITY AUDIT - Diyor Market\n");
    console.log("=".repeat(60));
    
    // 1. Check for test accounts
    console.log("\n📋 1. CHECKING FOR TEST ACCOUNTS");
    console.log("-".repeat(60));
    
    const testUsernames = ["admin", "customer", "rider", "superadmin", "testuser"];
    const testEmails = [
      "admin@diyormarket.com",
      "customer@diyormarket.com", 
      "rider@diyormarket.com",
      "superadmin@diyormarket.com",
      "test@example.com"
    ];
    
    const testUsers = await db.select()
      .from(users)
      .where(
        or(
          ...testUsernames.map(u => eq(users.username, u)),
          ...testEmails.map(e => eq(users.email, e))
        )
      );
    
    if (testUsers.length > 0) {
      console.log(`⚠️  FOUND ${testUsers.length} TEST ACCOUNTS IN DATABASE:`);
      testUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
        console.log(`     Created: ${user.createdAt || 'N/A'}`);
        console.log(`     Last Login: ${user.lastLoginAt || 'Never'}`);
      });
    } else {
      console.log("✅ No test accounts found in database");
    }
    
    // 2. Get all users count and roles
    console.log("\n📊 2. USER STATISTICS");
    console.log("-".repeat(60));
    
    const allUsers = await db.select().from(users);
    console.log(`Total users in database: ${allUsers.length}`);
    
    const usersByRole = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("\nUsers by role:");
    Object.entries(usersByRole).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count}`);
    });
    
    // 3. Check for users with common weak passwords (by checking if they match test patterns)
    console.log("\n🔐 3. PASSWORD SECURITY CHECK");
    console.log("-".repeat(60));
    console.log("⚠️  Note: Cannot verify actual passwords (they're hashed)");
    console.log("   But test accounts with predictable passwords are flagged above");
    
    // 4. Check recent user activity
    console.log("\n📅 4. RECENT USER ACTIVITY");
    console.log("-".repeat(60));
    
    const recentUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);
    
    console.log("10 Most recently created users:");
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.email}) - ${user.role} - Created: ${user.createdAt || 'N/A'}`);
    });
    
    const usersWithLogins = await db.select()
      .from(users)
      .where(sql`last_login_at IS NOT NULL`)
      .orderBy(desc(sql`last_login_at`))
      .limit(10);
    
    if (usersWithLogins.length > 0) {
      console.log("\n10 Most recent logins:");
      usersWithLogins.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} - Last login: ${user.lastLoginAt}`);
      });
    } else {
      console.log("\n⚠️  No users have logged in yet (last_login_at is null for all users)");
    }
    
    // 5. Check for inactive accounts
    console.log("\n🚫 5. INACTIVE ACCOUNTS");
    console.log("-".repeat(60));
    
    const inactiveUsers = await db.select()
      .from(users)
      .where(eq(users.isActive, false));
    
    if (inactiveUsers.length > 0) {
      console.log(`Found ${inactiveUsers.length} inactive accounts:`);
      inactiveUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log("✅ No inactive accounts found");
    }
    
    // 6. Check for accounts with suspicious patterns
    console.log("\n🔍 6. SUSPICIOUS PATTERNS");
    console.log("-".repeat(60));
    
    // Check for users with very old creation dates (might be test data)
    const oldUsers = await db.select()
      .from(users)
      .where(
        sql`created_at < NOW() - INTERVAL '1 year'`
      );
    
    if (oldUsers.length > 0) {
      console.log(`Found ${oldUsers.length} accounts created over 1 year ago (might be test data):`);
      oldUsers.slice(0, 5).forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Created: ${user.createdAt}`);
      });
    }
    
    // 7. Database connection info
    console.log("\n💾 7. DATABASE INFORMATION");
    console.log("-".repeat(60));
    const dbInfo = await db.execute(sql`SELECT version() as version`);
    console.log(`Database: PostgreSQL`);
    if (dbInfo.rows && dbInfo.rows[0]) {
      console.log(`Version: ${(dbInfo.rows[0] as any).version}`);
    }
    
    // 8. Recommendations
    console.log("\n💡 8. SECURITY RECOMMENDATIONS");
    console.log("-".repeat(60));
    
    if (testUsers.length > 0) {
      console.log("⚠️  CRITICAL: Test accounts found in database!");
      console.log("   Action required:");
      console.log("   1. Delete or deactivate test accounts");
      console.log("   2. Force password reset for any remaining test accounts");
      console.log("   3. Ensure test accounts are not accessible in production");
    }
    
    if (allUsers.length < 10) {
      console.log("ℹ️  Low user count - might still be in development/testing phase");
    }
    
    console.log("\n✅ Security audit complete!");
    console.log("=".repeat(60));
    
  } catch (error: any) {
    console.error("❌ Security audit error:", error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Run the audit
if (import.meta.url === `file://${process.argv[1]}`) {
  securityAudit();
}

