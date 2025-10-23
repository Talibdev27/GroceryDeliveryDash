import { config } from "dotenv";
import { db } from "../server/storage";
import { orders } from "../shared/schema";
import { sql } from "drizzle-orm";

config();

async function fixExistingOrders() {
  console.log("🔧 Fixing existing orders with incorrect delivery fees and calculations...");

  try {
    // Get all orders with old delivery fee (37500)
    const ordersToFix = await db.execute(sql`
      SELECT id, subtotal, delivery_fee, tax, total 
      FROM orders 
      WHERE delivery_fee = '37500'
    `);

    console.log(`📋 Found ${ordersToFix.rows.length} orders to fix`);

    if (ordersToFix.rows.length === 0) {
      console.log("✅ No orders need fixing!");
      return;
    }

    // Fix each order
    for (const order of ordersToFix.rows) {
      const orderId = order.id;
      const subtotal = parseFloat(order.subtotal as string);
      const oldDeliveryFee = parseFloat(order.delivery_fee as string);
      const oldTax = parseFloat(order.tax as string);
      const oldTotal = parseFloat(order.total as string);

      // Calculate new values
      const newDeliveryFee = 19000; // Correct delivery fee
      const newTax = 0; // No tax
      const newTotal = subtotal + newDeliveryFee + newTax;

      console.log(`\n🔄 Fixing Order #${orderId}:`);
      console.log(`   Subtotal: ${subtotal} сум (unchanged)`);
      console.log(`   Delivery Fee: ${oldDeliveryFee} → ${newDeliveryFee} сум`);
      console.log(`   Tax: ${oldTax} → ${newTax} сум`);
      console.log(`   Total: ${oldTotal} → ${newTotal} сум`);

      // Update the order
      await db.execute(sql`
        UPDATE orders 
        SET 
          delivery_fee = ${newDeliveryFee.toString()},
          tax = ${newTax.toString()},
          total = ${newTotal.toString()}
        WHERE id = ${orderId}
      `);

      console.log(`   ✅ Order #${orderId} updated successfully`);
    }

    console.log("\n🎉 All orders fixed successfully!");

    // Verify the changes
    console.log("\n📊 Verification - Updated orders:");
    const verifiedOrders = await db.execute(sql`
      SELECT id, subtotal, delivery_fee, tax, total 
      FROM orders 
      WHERE delivery_fee = '19000'
      ORDER BY id DESC
      LIMIT 10
    `);

    verifiedOrders.rows.forEach((order: any) => {
      console.log(`   Order #${order.id}: Subtotal=${order.subtotal}, Fee=${order.delivery_fee}, Tax=${order.tax}, Total=${order.total}`);
    });

  } catch (error) {
    console.error("❌ Error fixing orders:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixExistingOrders()
    .then(() => {
      console.log("\n✅ Order fix completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Order fix failed:", error);
      process.exit(1);
    });
}

export { fixExistingOrders };
