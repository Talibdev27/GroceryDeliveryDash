import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Load environment variables
config();

async function createSuperAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    // Check if super admin already exists
    const existingSuperAdmin = await db.select().from(users).where(eq(users.role, "super_admin"));
    
    if (existingSuperAdmin.length > 0) {
      console.log("Super admin already exists:");
      existingSuperAdmin.forEach(admin => {
        console.log(`- ${admin.username} (${admin.email})`);
      });
      return;
    }

    // Create super admin user
    const superAdminData = {
      username: "superadmin",
      email: "superadmin@diyormarket.com",
      password: await bcrypt.hash("SuperAdmin123!", 10),
      firstName: "Super",
      lastName: "Admin",
      role: "super_admin" as const,
      permissions: [
        "manage_products",
        "manage_users", 
        "manage_orders",
        "view_analytics",
        "manage_settings",
        "view_logs",
        "manage_admins",
        "system_maintenance"
      ],
      isActive: true
    };

    const result = await db.insert(users).values(superAdminData).returning();
    
    console.log("✅ Super Admin created successfully!");
    console.log(`Username: ${result[0].username}`);
    console.log(`Email: ${result[0].email}`);
    console.log(`Password: SuperAdmin123!`);
    console.log("\n🔐 Please change the password after first login!");
    console.log("\n🌐 Access Super Admin Dashboard at: http://localhost:3000/super-admin");

  } catch (error) {
    console.error("❌ Error creating super admin:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createSuperAdmin();
}
