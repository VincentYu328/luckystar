// backend/scripts/seed-dev-data.js
import db from "../src/database/db.js";
import bcrypt from "bcrypt";

console.log("==========================================");
console.log(" Lucky Star — Seed Development Data");
console.log("==========================================\n");

/**
 * 安全的库存写入（仅开发环境）
 * ——不删除触发器
 * ——不禁用 recursive_triggers
 * ——遵循 InventoryService 逻辑
 */
function devStockUpdate(productId, qty) {
  return db.transaction(() => {
    const existing = db
      .prepare("SELECT quantity_on_hand FROM stock_levels WHERE product_id = ?")
      .get(productId);

    if (existing) {
      db.prepare(
        `UPDATE stock_levels 
         SET quantity_on_hand = ?, last_updated = datetime('now')
         WHERE product_id = ?`
      ).run(qty, productId);
    } else {
      db.prepare(
        `INSERT INTO stock_levels (product_id, quantity_on_hand, last_updated)
         VALUES (?, ?, datetime('now'))`
      ).run(productId, qty);
    }
  })();
}

try {
  db.transaction(() => {
    console.log("👥 Creating test users...\n");

    // 1. Users
    const users = [
      {
        name: "Admin User",
        email: "admin@test.com",
        phone: "021-1000001",
        position: "Head",
        password: "admin123",
      },
      {
        name: "Manager User",
        email: "manager@test.com",
        phone: "021-1000002",
        position: "Manager",
        password: "manager123",
      },
      {
        name: "Sales User",
        email: "sales@test.com",
        phone: "021-1000003",
        position: "Sales",
        password: "sales123",
      },
    ];

    const userIds = {};

    for (const u of users) {
      const hash = bcrypt.hashSync(u.password, 10);
      const positionId = db
        .prepare("SELECT id FROM positions WHERE name = ?")
        .get(u.position).id;

      const result = db
        .prepare(
          `INSERT INTO users 
          (full_name, email, phone, position_id, password_hash, must_change_password)
          VALUES (?, ?, ?, ?, ?, 0)`
        )
        .run(u.name, u.email, u.phone, positionId, hash);

      userIds[u.position] = result.lastInsertRowid;
      console.log(`  ✅ ${u.name} (${u.email})`);
    }

    // 2. Customers
    console.log("\n👤 Creating test customers...\n");

    const customers = [
      { name: "John Smith", email: "john@example.com", phone: "021-2000001" },
      { name: "Jane Doe", email: "jane@example.com", phone: "021-2000002" },
      { name: "Bob Wilson", email: "bob@example.com", phone: "021-2000003" },
    ];

    const customerIds = [];

    for (const c of customers) {
      const result = db
        .prepare(
          `INSERT INTO customers (full_name, email, phone, type)
           VALUES (?, ?, ?, 'retail')`
        )
        .run(c.name, c.email, c.phone);

      customerIds.push(result.lastInsertRowid);
      console.log(`  ✅ ${c.name}`);
    }

    // 3. Fabrics
    console.log("\n🧵 Creating test fabrics...\n");

    const fabricCategoryId = db
      .prepare("SELECT id FROM product_categories WHERE code = 'fabric'")
      .get().id;

    const fabrics = [
      {
        sku: "FAB-001",
        name: "Cotton Plain White",
        material: "cotton",
        pattern: "plain",
        color: "white",
        price: 15,
      },
      {
        sku: "FAB-002",
        name: "Cotton Striped Blue",
        material: "cotton",
        pattern: "striped",
        color: "blue",
        price: 18,
      },
      {
        sku: "FAB-003",
        name: "Polyester Black",
        material: "polyester",
        pattern: "solid",
        color: "black",
        price: 12,
      },
    ];

    const fabricIds = [];

    for (const f of fabrics) {
      const result = db
        .prepare(
          `INSERT INTO products 
           (sku, name, category_id, product_type,
            material, pattern, color, width_cm,
            unit, base_price, cost_price)
            VALUES (?, ?, ?, 'fabric', ?, ?, ?, 150, 'meter', ?, ?)`
        )
        .run(
          f.sku,
          f.name,
          fabricCategoryId,
          f.material,
          f.pattern,
          f.color,
          f.price,
          f.price * 0.6
        );

      fabricIds.push(result.lastInsertRowid);
      console.log(`  ✅ ${f.sku} - ${f.name}`);
    }

    // 4. Garments
    console.log("\n👔 Creating test garments...\n");

    const garments = [
      {
        sku: "MEN-SHIRT-001",
        name: "Men's Dress Shirt",
        category: "mens",
        size: "L",
        price: 45,
        fabricIdx: 0,
      },
      {
        sku: "MEN-SHIRT-002",
        name: "Men's Casual Shirt",
        category: "mens",
        size: "M",
        price: 39,
        fabricIdx: 1,
      },
      {
        sku: "WOM-DRESS-001",
        name: "Women's Dress",
        category: "womens",
        size: "M",
        price: 89,
        fabricIdx: 0,
      },
      {
        sku: "BOY-SHIRT-001",
        name: "Boys' School Shirt",
        category: "boys",
        size: "12",
        price: 29,
        fabricIdx: 2,
      },
      {
        sku: "GIRL-DRESS-001",
        name: "Girls' Party Dress",
        category: "girls",
        size: "10",
        price: 49,
        fabricIdx: 1,
      },
    ];

    const garmentIds = [];

    for (const g of garments) {
      const categoryId = db
        .prepare("SELECT id FROM product_categories WHERE code = ?")
        .get(g.category).id;

      const result = db
        .prepare(
          `INSERT INTO products 
           (sku, name, category_id, product_type, fabric_id,
            style, gender, size_label, color,
            unit, base_price, cost_price)
          VALUES (?, ?, ?, 'garment', ?, 'casual', ?, ?, 'mixed', 'piece', ?, ?)`
        )
        .run(
          g.sku,
          g.name,
          categoryId,
          fabricIds[g.fabricIdx],
          g.category.includes("men") ? "male" : "female",
          g.size,
          g.price,
          g.price * 0.55
        );

      garmentIds.push(result.lastInsertRowid);
      console.log(`  ✅ ${g.sku} - ${g.name}`);
    }

    // 5. Inventory initialization
    console.log("\n📦 Initializing stock...\n");

    for (let i = 0; i < garmentIds.length; i++) {
      const qty = 20 + i * 5;

      db.prepare(
        `INSERT INTO inventory_transactions 
        (product_id, transaction_type, quantity_change, reason, operated_by)
        VALUES (?, 'in', ?, 'Initial stock', ?)`
      ).run(garmentIds[i], qty, userIds["Head"]);

      devStockUpdate(garmentIds[i], qty);

      console.log(`  ✅ ${garments[i].sku}: ${qty} items`);
    }

    // 6. Order
    console.log("\n🛒 Creating retail order...\n");

    const orderNum = `ORD-${Date.now()}`;

    const orderId = db
      .prepare(
        `INSERT INTO retail_orders
         (order_number, customer_id, status, channel, subtotal, total_amount, created_by)
         VALUES (?, ?, 'pending', 'in_store', 90, 90, ?)`
      )
      .run(orderNum, customerIds[0], userIds["Sales"]).lastInsertRowid;

    db.prepare(
      `INSERT INTO retail_order_items 
       (order_id, product_id, quantity, unit_price, subtotal,
        product_sku, product_name, size_label, color)
       VALUES (?, ?, 2, 45, 90, ?, ?, ?, 'mixed')`
    ).run(
      orderId,
      garmentIds[0],
      garments[0].sku,
      garments[0].name,
      garments[0].size
    );

    console.log(`  ✅ Retail order ${orderNum}`);

    // 7. Group order
    console.log("\n👥 Creating group order...\n");

    const groupOrderId = db
      .prepare(
        `INSERT INTO group_orders
         (leader_id, leader_name, leader_phone, leader_email,
          group_name, event_name, expected_members, fabric_selected)
         VALUES (?, ?, ?, ?, 'Corporate Team', 'Annual Conference', 50, ?)`
      )
      .run(
        customerIds[1],
        customers[1].name,
        customers[1].phone,
        customers[1].email,
        fabrics[0].sku
      ).lastInsertRowid;

    for (let i = 0; i < 3; i++) {
      db.prepare(
        `INSERT INTO group_members 
         (group_order_id, full_name, phone, email)
         VALUES (?, ?, ?, ?)`
      ).run(
        groupOrderId,
        `Member ${i + 1}`,
        `021-3000${i + 1}`,
        `member${i + 1}@example.com`
      );
    }

    console.log(`  ✅ Group order seeded`);
  })();

  console.log("\n📊 Summary:");
  console.log("==========================================");

  const stats = {
    users: db.prepare("SELECT COUNT(*) AS count FROM users").get().count,
    customers: db.prepare("SELECT COUNT(*) AS count FROM customers").get().count,
    fabrics: db
      .prepare("SELECT COUNT(*) AS count FROM products WHERE product_type='fabric'")
      .get().count,
    garments: db
      .prepare("SELECT COUNT(*) AS count FROM products WHERE product_type='garment'")
      .get().count,
    stock: db.prepare("SELECT COUNT(*) AS count FROM stock_levels").get().count,
    orders: db.prepare("SELECT COUNT(*) AS count FROM retail_orders").get().count,
    groupOrders: db
      .prepare("SELECT COUNT(*) AS count FROM group_orders")
      .get().count,
  };

  console.log(stats);
  console.log("\n==========================================");
  console.log("   Dev data seeded successfully!");
  console.log("==========================================\n");

  console.log("🔐 Test Accounts:");
  console.log("  Admin:   admin@test.com / admin123");
  console.log("  Manager: manager@test.com / manager123");
  console.log("  Sales:   sales@test.com / sales123");
  console.log("\n==========================================\n");
} catch (err) {
  console.error("\n❌ Error seeding dev data");
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}
