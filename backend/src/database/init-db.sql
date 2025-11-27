PRAGMA foreign_keys = ON;

----------------------------------------------------------------------
-- 1. System Config
----------------------------------------------------------------------

CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO system_config (key, value) VALUES ('mode', 'dev');


----------------------------------------------------------------------
-- 2. Roles / RBAC 基础结构
----------------------------------------------------------------------

CREATE TABLE roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT
);

INSERT INTO roles (name, description) VALUES
('admin',   'Full system access, can add new staff'),
('manager', 'Manage orders and inventory'),
('sales',   'Sales related operations');

CREATE TABLE role_hierarchy (
  parent_role_id INTEGER NOT NULL,
  child_role_id  INTEGER NOT NULL,
  PRIMARY KEY (parent_role_id, child_role_id),
  FOREIGN KEY (parent_role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (child_role_id)  REFERENCES roles(id) ON DELETE CASCADE,
  CHECK (parent_role_id != child_role_id)
);

INSERT INTO role_hierarchy (parent_role_id, child_role_id)
SELECT p.id, c.id FROM roles p, roles c
WHERE p.name='sales' AND c.name='manager';
INSERT INTO role_hierarchy (parent_role_id, child_role_id)
SELECT p.id, c.id FROM roles p, roles c
WHERE p.name='manager' AND c.name='admin';


----------------------------------------------------------------------
-- 3. Positions
----------------------------------------------------------------------

CREATE TABLE positions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  role_id     INTEGER NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 100,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO positions (name, description, role_id, sort_order)
SELECT 'Head', 'Store head / owner', id, 1 FROM roles WHERE name='admin';
INSERT INTO positions (name, description, role_id, sort_order)
SELECT 'Manager', 'Store manager', id, 2 FROM roles WHERE name='manager';
INSERT INTO positions (name, description, role_id, sort_order)
SELECT 'Sales', 'Sales staff', id, 3 FROM roles WHERE name='sales';


----------------------------------------------------------------------
-- 4. Users（内部员工）
----------------------------------------------------------------------

CREATE TABLE users (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name             TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  email                 TEXT UNIQUE,
  address               TEXT,
  wechat                TEXT,
  whatsapp              TEXT,
  position_id           INTEGER NOT NULL,
  password_hash         TEXT NOT NULL,
  must_change_password  INTEGER NOT NULL DEFAULT 1,
  is_active             INTEGER NOT NULL DEFAULT 1,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (position_id) REFERENCES positions(id)
);

CREATE INDEX idx_users_email ON users(email);


----------------------------------------------------------------------
-- 5. Audit Log
----------------------------------------------------------------------

CREATE TABLE audit_logs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER,
  action       TEXT NOT NULL,
  target_type  TEXT NOT NULL,
  target_id    INTEGER,
  details      TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);


----------------------------------------------------------------------
-- 6. Permission Modules
----------------------------------------------------------------------

CREATE TABLE permission_modules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT
);

INSERT INTO permission_modules (code, name, description) VALUES
('staff',       '员工与角色管理',   '管理内部员工账号、角色与权限'),
('products',    '产品管理',         '管理布料与成衣信息'),
('inventory',   '库存与进货',       '管理库存与进货单'),
('orders',      '订单管理',         '零售与团体订单管理'),
('customers',   '客户与团体',       '客户信息（含团体 leader 与成员）'),
('reports',     '报表与统计',       '销售、库存、订单报表');


----------------------------------------------------------------------
-- 7. Permissions
----------------------------------------------------------------------

CREATE TABLE permissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id   INTEGER NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  FOREIGN KEY (module_id) REFERENCES permission_modules(id)
);

-- Staff
INSERT INTO permissions (module_id, code, name, description) VALUES
((SELECT id FROM permission_modules WHERE code='staff'), 'staff.view', 'View Users', '查看员工列表'),
((SELECT id FROM permission_modules WHERE code='staff'), 'staff.create', 'Create User', '创建新员工'),
((SELECT id FROM permission_modules WHERE code='staff'), 'staff.update', 'Update User', '更新员工信息'),
((SELECT id FROM permission_modules WHERE code='staff'), 'staff.reset_password', 'Reset Password', '重置密码'),
((SELECT id FROM permission_modules WHERE code='staff'), 'staff.activate', 'Activate User', '启用员工'),
((SELECT id FROM permission_modules WHERE code='staff'), 'staff.deactivate', 'Deactivate User', '禁用员工');

-- Products
INSERT INTO permissions (module_id, code, name, description) VALUES
((SELECT id FROM permission_modules WHERE code='products'), 'products.view', 'View Products','查看产品'),
((SELECT id FROM permission_modules WHERE code='products'), 'products.create','Create Product','创建产品'),
((SELECT id FROM permission_modules WHERE code='products'), 'products.update','Update Product','更新产品'),
((SELECT id FROM permission_modules WHERE code='products'), 'products.delete','Delete Product','删除产品');

-- Inventory
INSERT INTO permissions (module_id, code, name, description) VALUES
((SELECT id FROM permission_modules WHERE code='inventory'), 'inventory.view','View Inventory','查看库存'),
((SELECT id FROM permission_modules WHERE code='inventory'), 'inventory.in','Stock In','入库'),
((SELECT id FROM permission_modules WHERE code='inventory'), 'inventory.out','Stock Out','出库'),
((SELECT id FROM permission_modules WHERE code='inventory'), 'inventory.adjust','Adjust Inventory','库存调整');

-- Orders
INSERT INTO permissions (module_id, code, name, description) VALUES
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.view','View Orders','查看订单'),
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.create','Create Order','创建订单'),
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.update','Update Order','更新订单'),
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.cancel','Cancel Order','取消订单');

-- Customers
INSERT INTO permissions (module_id, code, name, description) VALUES
((SELECT id FROM permission_modules WHERE code='customers'), 'customers.view','View Customers','查看客户'),
((SELECT id FROM permission_modules WHERE code='customers'), 'customers.create','Create Customer','新增客户'),
((SELECT id FROM permission_modules WHERE code='customers'), 'customers.update','Update Customer','修改客户');

-- Reports
INSERT INTO permissions (module_id, code, name, description) VALUES
((SELECT id FROM permission_modules WHERE code='reports'), 'reports.view','View Reports','查看报表'),
((SELECT id FROM permission_modules WHERE code='reports'), 'reports.export','Export Reports','导出报表');


----------------------------------------------------------------------
-- 8. Role-Permissions Mapping
----------------------------------------------------------------------

CREATE TABLE role_permissions (
  role_id       INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name='admin'), p.id FROM permissions p;

INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name='manager'), p.id 
FROM permissions p WHERE p.code NOT LIKE 'staff.%';

INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name='sales'), p.id
FROM permissions p WHERE p.code IN (
  'products.view','orders.view','orders.create','orders.update',
  'customers.view','customers.create','customers.update'
);


----------------------------------------------------------------------
-- 9. Customers
----------------------------------------------------------------------

CREATE TABLE customers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  address       TEXT,
  wechat        TEXT,
  whatsapp      TEXT,

  password_hash TEXT,                      -- ⭐ 新增：前台顾客需要密码登录
  is_active     INTEGER NOT NULL DEFAULT 1, -- ⭐ 新增：账号是否可用（默认启用）

  type          TEXT NOT NULL DEFAULT 'retail',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_customers_email ON customers(email);


----------------------------------------------------------------------
-- 10. Group Orders / Member
----------------------------------------------------------------------

CREATE TABLE group_orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  leader_id        INTEGER NOT NULL,
  leader_name      TEXT NOT NULL,
  leader_phone     TEXT NOT NULL,
  leader_email     TEXT NOT NULL,
  group_name       TEXT NOT NULL,
  event_name       TEXT,
  expected_members INTEGER,
  fabric_selected  TEXT NOT NULL,
  event_start      TEXT,
  event_end        TEXT,
  notes            TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (leader_id) REFERENCES customers(id) ON DELETE CASCADE
);
CREATE INDEX idx_group_orders_leader ON group_orders(leader_id);

CREATE TABLE group_members (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  group_order_id    INTEGER NOT NULL,
  customer_id       INTEGER,
  full_name         TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT,
  note              TEXT,
  FOREIGN KEY (group_order_id) REFERENCES group_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);
CREATE INDEX idx_group_members_order ON group_members(group_order_id);


----------------------------------------------------------------------
-- 11. Product Categories
----------------------------------------------------------------------

CREATE TABLE product_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  parent_id   INTEGER,
  sort_order  INTEGER NOT NULL DEFAULT 100,
  is_active   INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (parent_id) REFERENCES product_categories(id)
);

INSERT INTO product_categories (code, name, parent_id, sort_order) VALUES
('fabric','Fabrics',NULL,1),
('garment','Garments',NULL,2);

INSERT INTO product_categories (code, name, parent_id, sort_order) VALUES
('mens','Men (男装)',(SELECT id FROM product_categories WHERE code='garment'),3),
('womens','Women (女装)',(SELECT id FROM product_categories WHERE code='garment'),4),
('boys','Boys (男童)',(SELECT id FROM product_categories WHERE code='garment'),5),
('girls','Girls (女童)',(SELECT id FROM product_categories WHERE code='garment'),6);

----------------------------------------------------------------------
-- 12. Products（核心表）
----------------------------------------------------------------------

CREATE TABLE products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  sku           TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  category_id   INTEGER NOT NULL,
  product_type  TEXT NOT NULL,   -- 'fabric' | 'garment'
  material      TEXT,
  pattern       TEXT,
  width_cm      REAL,
  fabric_id     INTEGER,
  style         TEXT,
  gender        TEXT,
  size_label    TEXT,
  color         TEXT,
  unit          TEXT NOT NULL DEFAULT 'piece',
  base_price    REAL NOT NULL,
  cost_price    REAL,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES product_categories(id),
  FOREIGN KEY (fabric_id)   REFERENCES products(id)
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_sku ON products(sku);


----------------------------------------------------------------------
-- 13. Fabric Incoming（布料进货）
----------------------------------------------------------------------

CREATE TABLE fabric_incoming (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  fabric_id       INTEGER NOT NULL,
  quantity        REAL NOT NULL,
  unit_price      REAL,
  supplier_name   TEXT,
  invoice_number  TEXT,
  received_at     TEXT NOT NULL DEFAULT (datetime('now')),
  created_by      INTEGER,
  notes           TEXT,
  FOREIGN KEY (fabric_id) REFERENCES products(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_fabric_incoming_fabric ON fabric_incoming(fabric_id);
CREATE INDEX idx_fabric_incoming_date ON fabric_incoming(received_at);


----------------------------------------------------------------------
-- 14. Fabric Usage（裁剪用料）
----------------------------------------------------------------------

CREATE TABLE garment_fabric_usage (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  fabric_id       INTEGER NOT NULL,
  garment_id      INTEGER,
  used_quantity   REAL NOT NULL,
  usage_type      TEXT NOT NULL DEFAULT 'cut',
  reference_type  TEXT,
  reference_id    INTEGER,
  used_at         TEXT NOT NULL DEFAULT (datetime('now')),
  operated_by     INTEGER,
  notes           TEXT,
  FOREIGN KEY (fabric_id) REFERENCES products(id),
  FOREIGN KEY (garment_id) REFERENCES products(id),
  FOREIGN KEY (operated_by) REFERENCES users(id)
);

CREATE INDEX idx_fabric_usage_fabric ON garment_fabric_usage(fabric_id);
CREATE INDEX idx_fabric_usage_date ON garment_fabric_usage(used_at);


----------------------------------------------------------------------
-- 15. Fabric 类型强制触发器（业务安全）
----------------------------------------------------------------------

CREATE TRIGGER trg_fabric_incoming_only_fabric
BEFORE INSERT ON fabric_incoming
FOR EACH ROW
WHEN (SELECT product_type FROM products WHERE id = NEW.fabric_id) != 'fabric'
BEGIN
  SELECT RAISE(ABORT,'fabric_incoming.fabric_id must reference fabric');
END;

CREATE TRIGGER trg_fabric_usage_only_fabric
BEFORE INSERT ON garment_fabric_usage
FOR EACH ROW
WHEN (SELECT product_type FROM products WHERE id = NEW.fabric_id) != 'fabric'
BEGIN
  SELECT RAISE(ABORT,'garment_fabric_usage.fabric_id must reference fabric');
END;

CREATE TRIGGER trg_fabric_usage_only_garment
BEFORE INSERT ON garment_fabric_usage
FOR EACH ROW
WHEN NEW.garment_id IS NOT NULL
AND (SELECT product_type FROM products WHERE id = NEW.garment_id) != 'garment'
BEGIN
  SELECT RAISE(ABORT,'garment_fabric_usage.garment_id must reference garment');
END;


----------------------------------------------------------------------
-- 16. Product Images
----------------------------------------------------------------------

CREATE TABLE product_images (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 1,
  is_primary  INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);


----------------------------------------------------------------------
-- 17. Size Charts / Items
----------------------------------------------------------------------

CREATE TABLE size_charts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  gender      TEXT,
  category_id INTEGER,
  notes       TEXT,
  FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

CREATE TABLE size_chart_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  chart_id      INTEGER NOT NULL,
  size_label    TEXT NOT NULL,
  chest         REAL,
  waist         REAL,
  hip           REAL,
  height        REAL,
  shoulder      REAL,
  sleeve        REAL,
  inseam        REAL,
  length        REAL,
  notes         TEXT,
  FOREIGN KEY(chart_id) REFERENCES size_charts(id) ON DELETE CASCADE
);


----------------------------------------------------------------------
-- 18. Measurements
----------------------------------------------------------------------

CREATE TABLE measurements (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id       INTEGER,
  group_member_id   INTEGER,
  source            TEXT NOT NULL DEFAULT 'staff',
  unit              TEXT NOT NULL DEFAULT 'cm',
  height            REAL,
  chest             REAL,
  waist             REAL,
  hip               REAL,
  shoulder_width    REAL,
  sleeve_length     REAL,
  inseam            REAL,
  notes             TEXT,
  measured_by       INTEGER,
  measured_at       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (group_member_id) REFERENCES group_members(id) ON DELETE CASCADE,
  FOREIGN KEY (measured_by) REFERENCES users(id),
  CHECK ((customer_id IS NOT NULL AND group_member_id IS NULL) OR
         (customer_id IS NULL AND group_member_id IS NOT NULL))
);
CREATE INDEX idx_measurements_customer ON measurements(customer_id);
CREATE INDEX idx_measurements_member ON measurements(group_member_id);


----------------------------------------------------------------------
-- 19. Garment Inventory Table
----------------------------------------------------------------------

CREATE TABLE stock_levels (
  product_id        INTEGER PRIMARY KEY,
  quantity_on_hand  REAL NOT NULL DEFAULT 0,
  reorder_point     REAL,
  last_updated      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


----------------------------------------------------------------------
-- 20. Inventory Transactions（唯一入口）
----------------------------------------------------------------------

CREATE TABLE inventory_transactions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id        INTEGER NOT NULL,
  transaction_type  TEXT NOT NULL,
  quantity_change   REAL NOT NULL,
  reference_type    TEXT,
  reference_id      INTEGER,
  reason            TEXT,
  operated_by       INTEGER,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (operated_by) REFERENCES users(id)
);

CREATE INDEX idx_inventory_trans_product ON inventory_transactions(product_id);


----------------------------------------------------------------------
-- 21. Retail Orders
----------------------------------------------------------------------

CREATE TABLE retail_orders (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number      TEXT NOT NULL UNIQUE,
  customer_id       INTEGER,
  status            TEXT NOT NULL DEFAULT 'pending',
  channel           TEXT NOT NULL DEFAULT 'in_store',
  subtotal          REAL NOT NULL DEFAULT 0,
  discount_amount   REAL NOT NULL DEFAULT 0,
  discount_rate     REAL,
  total_amount      REAL NOT NULL DEFAULT 0,
  deposit_amount    REAL DEFAULT 0,
  deposit_paid      INTEGER NOT NULL DEFAULT 0,
  order_date        TEXT NOT NULL DEFAULT (datetime('now')),
  due_date          TEXT,
  confirmed_date    TEXT,
  completed_date    TEXT,
  created_by        INTEGER,
  confirmed_by      INTEGER,
  notes             TEXT,
  FOREIGN KEY (customer_id)  REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)   REFERENCES users(id),
  FOREIGN KEY (confirmed_by) REFERENCES users(id)
);

CREATE INDEX idx_retail_orders_customer ON retail_orders(customer_id);
CREATE INDEX idx_retail_orders_status ON retail_orders(status);


----------------------------------------------------------------------
-- 22. Retail Order Items
----------------------------------------------------------------------

CREATE TABLE retail_order_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id          INTEGER NOT NULL,
  product_id        INTEGER NOT NULL,
  quantity          REAL NOT NULL DEFAULT 1,
  unit_price        REAL NOT NULL,
  subtotal          REAL NOT NULL,
  product_sku       TEXT,
  product_name      TEXT,
  size_label        TEXT,
  color             TEXT,
  notes             TEXT,
  FOREIGN KEY (order_id)   REFERENCES retail_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE INDEX idx_retail_order_items_order ON retail_order_items(order_id);


----------------------------------------------------------------------
-- 23. Group Order Fabrics
----------------------------------------------------------------------

CREATE TABLE group_order_fabrics (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  group_order_id    INTEGER NOT NULL,
  fabric_id         INTEGER NOT NULL,
  is_primary        INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (group_order_id) REFERENCES group_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (fabric_id) REFERENCES products(id)
);
CREATE INDEX idx_group_order_fabrics_order ON group_order_fabrics(group_order_id);


----------------------------------------------------------------------
-- 24. Payments
----------------------------------------------------------------------

CREATE TABLE payments (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  order_type          TEXT NOT NULL,
  order_id            INTEGER NOT NULL,
  payment_type        TEXT NOT NULL,
  payment_method      TEXT NOT NULL,
  amount              REAL NOT NULL,
  payment_date        TEXT NOT NULL DEFAULT (datetime('now')),
  transfer_reference  TEXT,
  transfer_verified   INTEGER DEFAULT 0,
  verified_by         INTEGER,
  verified_date       TEXT,
  notes               TEXT,
  received_by         INTEGER,
  FOREIGN KEY (received_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);
CREATE INDEX idx_payments_order ON payments(order_type, order_id);


----------------------------------------------------------------------
-- 25. Auto-update timestamp triggers
----------------------------------------------------------------------

CREATE TRIGGER trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER trg_customers_updated_at
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
  UPDATE customers SET updated_at = datetime('now') WHERE id = NEW.id;
END;


----------------------------------------------------------------------
-- 26. Production Safety (block stock manipulations)
----------------------------------------------------------------------

CREATE TRIGGER trg_block_direct_stock_insert
BEFORE INSERT ON stock_levels
WHEN (SELECT value FROM system_config WHERE key='mode')='prod'
BEGIN
  SELECT RAISE(ABORT,'SECURITY: direct stock insert forbidden');
END;

CREATE TRIGGER trg_block_direct_stock_update
BEFORE UPDATE ON stock_levels
WHEN (SELECT value FROM system_config WHERE key='mode')='prod'
AND NEW.quantity_on_hand != OLD.quantity_on_hand
BEGIN
  SELECT RAISE(ABORT,'SECURITY: direct stock update forbidden');
END;

CREATE TRIGGER trg_block_direct_stock_delete
BEFORE DELETE ON stock_levels
WHEN (SELECT value FROM system_config WHERE key='mode')='prod'
BEGIN
  SELECT RAISE(ABORT,'SECURITY: direct stock delete forbidden');
END;


----------------------------------------------------------------------
-- 27. v_stock_levels（成衣库存）
----------------------------------------------------------------------

CREATE VIEW v_stock_levels AS
SELECT
  sl.product_id,
  p.sku,
  p.name AS product_name,
  p.product_type,
  sl.quantity_on_hand,
  sl.reorder_point,
  sl.last_updated,
  CASE
    WHEN sl.reorder_point IS NOT NULL AND sl.quantity_on_hand <= sl.reorder_point THEN 1
    ELSE 0
  END AS needs_reorder
FROM stock_levels sl
JOIN products p ON p.id = sl.product_id;


----------------------------------------------------------------------
-- 28. v_inventory_summary（成衣库存统计）
----------------------------------------------------------------------

CREATE VIEW v_inventory_summary AS
SELECT
  p.id AS product_id,
  p.sku,
  p.name,
  p.product_type,
  COALESCE(sl.quantity_on_hand, 0) AS current_stock,
  COALESCE(SUM(CASE WHEN it.transaction_type='in'  THEN it.quantity_change ELSE 0 END),0) AS total_in,
  COALESCE(SUM(CASE WHEN it.transaction_type='out' THEN ABS(it.quantity_change) ELSE 0 END),0) AS total_out,
  COUNT(it.id) AS transaction_count,
  MAX(it.created_at) AS last_transaction
FROM products p
LEFT JOIN stock_levels sl ON sl.product_id = p.id
LEFT JOIN inventory_transactions it ON it.product_id = p.id
WHERE p.product_type='garment'
GROUP BY p.id;


----------------------------------------------------------------------
-- 29. v_fabric_stock（布料库存：IN - OUT）
----------------------------------------------------------------------

CREATE VIEW v_fabric_stock AS
WITH incoming AS (
  SELECT fabric_id, COALESCE(SUM(quantity),0) AS total_in
  FROM fabric_incoming
  GROUP BY fabric_id
),
usage AS (
  SELECT fabric_id, COALESCE(SUM(used_quantity),0) AS total_used
  FROM garment_fabric_usage
  GROUP BY fabric_id
)
SELECT
  p.id AS fabric_id,
  p.sku,
  p.name AS fabric_name,
  p.material,
  p.pattern,
  p.width_cm,
  COALESCE(i.total_in,0) AS total_in,
  COALESCE(u.total_used,0) AS total_used,
  COALESCE(i.total_in,0) - COALESCE(u.total_used,0) AS stock_balance
FROM products p
LEFT JOIN incoming i ON i.fabric_id = p.id
LEFT JOIN usage u ON u.fabric_id = p.id
WHERE p.product_type='fabric';


/* ===========================================================
   TEST DATA BLOCK — DISABLED
   Verified by: Vincent Yu
   Verified on: 2025-11-23
   Status: DISABLED

   说明：
   - 此区块已完全注释，不会执行任何测试插入或查询
   - 可在需要调试时手动取消注释
   =========================================================== */

-- =======================
-- 0. 创建测试用户
-- =======================

-- INSERT INTO users (full_name, phone, email, position_id, password_hash, must_change_password)
-- VALUES ('Test Admin', '0200000000', 'admin@test.com',
--         (SELECT id FROM positions WHERE name='Head'),
--         'testhash', 0);

-- INSERT INTO users (full_name, phone, email, position_id, password_hash, must_change_password)
-- VALUES ('Test Sales', '0211111111', 'sales@test.com',
--         (SELECT id FROM positions WHERE name='Sales'),
--         'testhash', 0);


-- =======================
-- 1. Customers
-- =======================

-- INSERT INTO customers (full_name, phone, email)
-- VALUES ('John Doe', '0220000000', 'john@example.com'),
--        ('Mary GroupLeader', '0221111111', 'mary@example.com');


-- =======================
-- 2. Products（Fabric + Garment）
-- =======================

-- INSERT INTO products (sku, name, category_id, product_type, material, pattern, width_cm, unit, base_price)
-- VALUES ('FAB-001', 'Blue Cotton', (SELECT id FROM product_categories WHERE code='fabric'),
--         'fabric', 'Cotton', 'Solid', 150, 'meter', 12.5);

-- INSERT INTO products (sku, name, category_id, product_type, fabric_id, style, gender, size_label, color, base_price)
-- VALUES ('GAR-001', 'School Shirt', 
--         (SELECT id FROM product_categories WHERE code='boys'),
--         'garment',
--         (SELECT id FROM products WHERE sku='FAB-001'),
--         'shirt', 'boys', 'M', 'white', 35);


-- =======================
-- 3. Fabric Incoming / Usage
-- =======================

-- INSERT INTO fabric_incoming (fabric_id, quantity, unit_price, supplier_name, created_by)
-- VALUES ((SELECT id FROM products WHERE sku='FAB-001'), 50, 8.5, 'ABC Supplier',
--         (SELECT id FROM users WHERE email='admin@test.com'));

-- INSERT INTO garment_fabric_usage (fabric_id, garment_id, used_quantity, operated_by)
-- VALUES ((SELECT id FROM products WHERE sku='FAB-001'),
--         (SELECT id FROM products WHERE sku='GAR-001'),
--         1.8,
--         (SELECT id FROM users WHERE email='sales@test.com'));


-- =======================
-- 4. Stock Levels
-- =======================

-- INSERT INTO stock_levels (product_id, quantity_on_hand, reorder_point)
-- VALUES ((SELECT id FROM products WHERE sku='GAR-001'), 15, 5);


-- =======================
-- 5. Retail Orders + Items
-- =======================

-- INSERT INTO retail_orders (order_number, customer_id, subtotal, total_amount, created_by)
-- VALUES ('RO-TEST-0001',
--         (SELECT id FROM customers WHERE email='john@example.com'),
--         35, 35,
--         (SELECT id FROM users WHERE email='sales@test.com'));

-- INSERT INTO retail_order_items (order_id, product_id, quantity, unit_price, subtotal)
-- VALUES (
--   (SELECT id FROM retail_orders WHERE order_number='RO-TEST-0001'),
--   (SELECT id FROM products WHERE sku='GAR-001'),
--   1, 35, 35
-- );


-- =======================
-- 6. Payments
-- =======================

-- INSERT INTO payments (order_type, order_id, payment_type, payment_method, amount, received_by)
-- VALUES ('retail',
--         (SELECT id FROM retail_orders WHERE order_number='RO-TEST-0001'),
--         'full', 'cash', 35,
--         (SELECT id FROM users WHERE email='sales@test.com'));


-- =======================
-- Validation Queries
-- =======================

-- SELECT '=== Row Counts ===' AS section;
-- SELECT 'users', COUNT(*) FROM users
-- UNION ALL SELECT 'customers', COUNT(*) FROM customers
-- UNION ALL SELECT 'products', COUNT(*) FROM products
-- UNION ALL SELECT 'fabric_incoming', COUNT(*) FROM fabric_incoming
-- UNION ALL SELECT 'garment_fabric_usage', COUNT(*) FROM garment_fabric_usage
-- UNION ALL SELECT 'stock_levels', COUNT(*) FROM stock_levels
-- UNION ALL SELECT 'retail_orders', COUNT(*) FROM retail_orders
-- UNION ALL SELECT 'retail_order_items', COUNT(*) FROM retail_order_items
-- UNION ALL SELECT 'payments', COUNT(*) FROM payments;

-- SELECT '=== v_stock_levels ===' AS section;
-- SELECT * FROM v_stock_levels;

-- SELECT '=== v_fabric_stock ===' AS section;
-- SELECT * FROM v_fabric_stock;

-- SELECT '=== v_inventory_summary ===' AS section;
-- SELECT * FROM v_inventory_summary;

-- SELECT '=== audit_logs (should be empty) ===' AS section;
-- SELECT COUNT(*) FROM audit_logs;


-- ===========================================================
-- END OF DISABLED TEST BLOCK
-- ===========================================================
