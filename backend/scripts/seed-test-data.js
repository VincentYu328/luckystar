import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv"; // 引入 dotenv

// ==========================================
// 🎯 修正: 强制加载环境变量并解析数据库路径
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, '..'); 

// 1. 强制加载 .env.development 或 .env 文件
const envFile = process.env.NODE_ENV === 'production' 
    ? '../.env' 
    : '../.env.development';

dotenv.config({ path: path.resolve(backendRoot, envFile) });

const dbFilePath = process.env.DB_FILE; 

if (!dbFilePath || dbFilePath === ':memory:') {
    throw new Error('❌ 无法从 .env 文件中获取有效的 DB_FILE 路径。请确保 DB_FILE=./src/database/app.db 已设置。');
}

// 2. 解析为绝对路径
const absoluteDbPath = path.resolve(backendRoot, dbFilePath);

console.log("==========================================");
console.log(" Lucky Star — Seed Test Inventory Data");
console.log("==========================================\n");
console.log(`\u{1F4C0} Database file path: ${absoluteDbPath}`); // 打印路径确认

// 3. 直接连接数据库（替换硬编码路径）
const db = new Database(absoluteDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * 手工模拟 InventoryService.recordTransaction()
 * —— 不删除触发器
 * —— 不禁用 recursive_triggers
 * —— 用于开发环境
 */
function simulateTransaction({ productId, transactionType, quantityChange, operatedBy, reason }) {
    // ... [函数体保持不变] ...
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

        console.log(`   ✔ ${transactionType.toUpperCase()} ${quantityChange} \u{2192} new qty: ${newQty}`);

        return { transactionId: txInfo.lastInsertRowid, oldQty, newQty };
    })();
}

try {
    console.log("📦 Seeding inventory test data...\n");

    // 假设 GAR001 在 seed-dev-data.js 中被创建
    const product = db.prepare(`
      SELECT id, sku, name 
      FROM products 
      WHERE sku = ?
    `).get("MEN-SHIRT-001"); // 使用你在 seed-dev-data 中创建的 SKU

    const user = db.prepare(`
      SELECT id, full_name 
      FROM users 
      WHERE email = ?
    `).get("admin@test.com");

    if (!product) {
        // 如果产品不存在，可能是因为没有运行 seed-dev-data，或者 SKU 不匹配
        console.error("❌ Product MEN-SHIRT-001 not found. Please run seed-dev-data.js first.");
        process.exit(1);
    }

    if (!user) {
        console.error("❌ Admin user not found. Please run init-db.js / create-admin.js first.");
        process.exit(1);
    }

    console.log(`📌 Product: ${product.sku} — ${product.name}`);
    console.log(`📌 Operator: ${user.full_name}\n`);

    // ... [以下情景测试逻辑保持不变] ...

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

    console.log(`   SKU: ${finalStock.sku}`);
    console.log(`   Name: ${finalStock.name}`);
    console.log(`   Quantity: ${finalStock.quantity_on_hand}`);
    console.log(`   Last Updated: ${finalStock.last_updated}`);

    console.log("\n📜 Transaction History:");
    const history = db.prepare(`
      SELECT transaction_type, quantity_change, reason, created_at
      FROM inventory_transactions
      WHERE product_id = ?
      ORDER BY created_at ASC
    `).all(product.id);

    history.forEach((tx, i) => {
        console.log(
            `   ${i + 1}. ${tx.transaction_type.toUpperCase()} ${tx.quantity_change > 0 ? "+" : ""}${tx.quantity_change} (${tx.reason}) at ${tx.created_at}`
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