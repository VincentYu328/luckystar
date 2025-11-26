// backend/scripts/check-db-health.js
import db, { checkDatabaseHealth } from '../src/database/db.js';

console.log('==========================================');
console.log(' Lucky Star — Database Health Check');
console.log('==========================================\n');

try {
  // 执行健康检查
  const health = checkDatabaseHealth();

  console.log('📊 Health Status:');
  console.log(`   Overall: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`   Integrity: ${health.integrity ? '✅ OK' : '❌ Failed'}`);
  console.log(`   Foreign Keys: ${health.foreignKeysEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   Checked at: ${health.timestamp}`);

  if (!health.healthy) {
    console.log(`\n❌ Error: ${health.error}`);
    process.exit(1);
  }

  // 检查关键表是否存在
  console.log('\n📋 Table Verification:');
  const requiredTables = [
    'users', 'roles', 'positions', 'customers', 'products', 
    'stock_levels', 'inventory_transactions', 'retail_orders'
  ];

  const existingTables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all().map(t => t.name);

  const missingTables = requiredTables.filter(t => !existingTables.includes(t));

  if (missingTables.length > 0) {
    console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
    process.exit(1);
  } else {
    console.log(`   ✅ All required tables present (${requiredTables.length}/${requiredTables.length})`);
  }

  // 检查视图
  console.log('\n👁️  View Verification:');
  const views = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='view'
  `).all();

  if (views.length > 0) {
    console.log(`   ✅ Views found: ${views.length}`);
    views.forEach(v => console.log(`      - ${v.name}`));
  } else {
    console.log('   ⚠️  No views found');
  }

  // 检查触发器
  console.log('\n⚡ Trigger Verification:');
  const triggers = db.prepare(`
    SELECT name, tbl_name FROM sqlite_master 
    WHERE type='trigger'
    ORDER BY tbl_name, name
  `).all();

  if (triggers.length > 0) {
    console.log(`   ✅ Triggers found: ${triggers.length}`);
    triggers.forEach(t => console.log(`      - ${t.name} on ${t.tbl_name}`));
  } else {
    console.log('   ⚠️  No triggers found');
  }

  // 检查索引
  console.log('\n🔍 Index Verification:');
  const indexes = db.prepare(`
    SELECT name, tbl_name FROM sqlite_master 
    WHERE type='index' AND name NOT LIKE 'sqlite_%'
    ORDER BY tbl_name, name
  `).all();

  if (indexes.length > 0) {
    console.log(`   ✅ Indexes found: ${indexes.length}`);
  } else {
    console.log('   ⚠️  No custom indexes found');
  }

  // 数据统计
  console.log('\n📈 Data Statistics:');
  const stats = [
    { table: 'users', label: 'Staff Users' },
    { table: 'customers', label: 'Customers' },
    { table: 'products', label: 'Products' },
    { table: 'stock_levels', label: 'Products in Stock' },
    { table: 'inventory_transactions', label: 'Inventory Transactions' },
    { table: 'retail_orders', label: 'Retail Orders' },
    { table: 'group_orders', label: 'Group Orders' }
  ];

  stats.forEach(({ table, label }) => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`   ${label}: ${count.count}`);
  });

  // 检查库存一致性
console.log('\n🔐 Inventory Consistency Check:');

const inventoryCheck = db.prepare(`
  SELECT 
    p.sku,
    p.name,
    sl.quantity_on_hand,
    (
      SELECT COALESCE(SUM(quantity_change), 0)
      FROM inventory_transactions
      WHERE product_id = p.id
    ) AS calculated_qty
  FROM products p
  LEFT JOIN stock_levels sl ON sl.product_id = p.id
  WHERE 
    p.product_type = 'garment'
    AND sl.quantity_on_hand IS NOT NULL
    AND sl.quantity_on_hand != (
      SELECT COALESCE(SUM(quantity_change), 0)
      FROM inventory_transactions
      WHERE product_id = p.id
    )
`).all();

if (inventoryCheck.length > 0) {
  console.log('   ❌ Inventory inconsistencies found:');
  inventoryCheck.forEach(item => {
    console.log(`      ${item.sku}: recorded=${item.quantity_on_hand}, calculated=${item.calculated_qty}`);
  });
} else {
  console.log('   ✅ All inventory records are consistent');
}

  // WAL 文件状态
  console.log('\n💾 Database Files:');
  const pragmas = {
    'Page Size': db.pragma('page_size', { simple: true }),
    'Page Count': db.pragma('page_count', { simple: true }),
    'Journal Mode': db.pragma('journal_mode', { simple: true }),
    'Synchronous': db.pragma('synchronous', { simple: true }),
    'Cache Size': db.pragma('cache_size', { simple: true })
  };

  Object.entries(pragmas).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  const dbSize = db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get();
  console.log(`   Database Size: ${(dbSize.size / 1024 / 1024).toFixed(2)} MB`);

  console.log('\n✅ Database health check completed successfully!');
  console.log('==========================================\n');

  process.exit(0);

} catch (error) {
  console.error('\n❌ Health check failed:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}