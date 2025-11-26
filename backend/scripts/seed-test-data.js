// backend/scripts/seed-test-data.js
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../src/database/app.db");

console.log("==========================================");
console.log(" Lucky Star — Seed Test Inventory Data");
console.log("==========================================\n");

const db = new Database(dbPath);

/**
 * 手工模拟 InventoryService.recordTransaction()
 * —— 不删除触发器
 * —— 不禁用 recursive_triggers
 * —— 用于开发环境
 */
function simulateTransaction({ productId, transactionType, quantityChange, operatedBy, reason }) {
  return db.transaction(() => {
    const validTypes = ["in", "out", "adjust"];
    if (!validTypes.includes(transactionType)) {
      throw new Error(`Invalid transaction type: ${transactionType}`);
    }

    // 记录库存流水
    const txInfo = db.prepare(`
      INSERT INTO inventory_transactions 
      (product_id, transaction_type, quantity_change, reason, operated_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(productId, transactionType, quantityChange, reason, operatedBy);

    // 库存当前值
    const existing = db.prepare(`
      SELECT quantity_on_hand 
      FROM stock_levels 
      WHERE product_id = ?
    `).get(productId);

    const oldQty = existing?.quantity_on_hand || 0;
    const newQty = oldQty + quantityChange;

    // 更新库存（开发环境，不会触发 prod 安全触发器）
    if (existing) {
      db.prepare(`
        UPDATE stock_levels
        SET quantity_on_hand = ?, last_updated = datetime('now')
        WHERE product_id = ?
      `).run(newQty, productId);
    } else {
      db.prepare(`
        INSERT INTO stock_levels (product_id, quantity_on_hand, last_updated)
        VALUES (?, ?, datetime('now'))
      `).run(productId, newQty);
    }

    console.log(`   ✔ ${transactionType.toUpperCase()} ${quantityChange} → new qty: ${newQty}`);

    return { transactionId: txInfo.lastInsertRowid, oldQty, newQty };
  })();
}

try {
  console.log("📦 Seeding inventory test data...\n");

  const product = db.prepare(`
    SELECT id, sku, name 
    FROM products 
    WHERE sku = ?
  `).get("GAR001");

  const user = db.prepare(`
    SELECT id, full_name 
    FROM users 
    WHERE email = ?
  `).get("admin@test.com");

  if (!product) {
    console.error("❌ Product GAR001 not found. Please run db:init first.");
    process.exit(1);
  }

  if (!user) {
    console.error("❌ Admin user not found. Please run db:init first.");
    process.exit(1);
  }

  console.log(`📌 Product: ${product.sku} — ${product.name}`);
  console.log(`📌 Operator: ${user.full_name}\n`);

  console.log("Scenario 1: Initial stock in (+10)");
  simulateTransaction({
    productId: product.id,
    transactionType: "in",
    quantityChange: 10,
    operatedBy: user.id,
    reason: "Initial stock purchase"
  });

  console.log("Scenario 2: Restock (+5)");
  simulateTransaction({
    productId: product.id,
    transactionType: "in",
    quantityChange: 5,
    operatedBy: user.id,
    reason: "Supplier restock"
  });

  console.log("Scenario 3: Retail sale (-3)");
  simulateTransaction({
    productId: product.id,
    transactionType: "out",
    quantityChange: -3,
    operatedBy: user.id,
    reason: "Retail sale order ORDER001"
  });

  console.log("Scenario 4: Adjustment (-1, damaged)");
  simulateTransaction({
    productId: product.id,
    transactionType: "adjust",
    quantityChange: -1,
    operatedBy: user.id,
    reason: "Damaged during handling"
  });

  console.log("\n📊 Final Stock Status:");
  const finalStock = db.prepare(`
    SELECT 
      p.sku, p.name,
      sl.quantity_on_hand,
      sl.last_updated
    FROM stock_levels sl
      JOIN products p ON p.id = sl.product_id
    WHERE sl.product_id = ?
  `).get(product.id);

  console.log(`   SKU: ${finalStock.sku}`);
  console.log(`   Name: ${finalStock.name}`);
  console.log(`   Quantity: ${finalStock.quantity_on_hand}`);
  console.log(`   Last Updated: ${finalStock.last_updated}`);

  console.log("\n📜 Transaction History:");
  const history = db.prepare(`
    SELECT transaction_type, quantity_change, reason, created_at
    FROM inventory_transactions
    WHERE product_id = ?
    ORDER BY created_at ASC
  `).all(product.id);

  history.forEach((tx, i) => {
    console.log(
      `   ${i + 1}. ${tx.transaction_type.toUpperCase()} ${tx.quantity_change > 0 ? "+" : ""}${tx.quantity_change} (${tx.reason}) at ${tx.created_at}`
    );
  });

  console.log("\n✅ Test data seeded successfully!");
  console.log("==========================================\n");

} catch (err) {
  console.error("\n❌ Failed to seed test data");
  console.error(err.message);
  process.exit(1);
} finally {
  db.close();
}
