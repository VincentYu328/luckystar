PRAGMA foreign_keys = ON;

----------------------------------------------------------------------
-- 1. System Config
----------------------------------------------------------------------

CREATE TABLE system_config (
  key     TEXT PRIMARY KEY,
  value   TEXT NOT NULL
);
INSERT INTO system_config (key, value) VALUES ('mode', 'dev');


----------------------------------------------------------------------
-- 2. Roles / RBAC 基础结构
----------------------------------------------------------------------

CREATE TABLE roles (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT
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

-- Admin 继承 Manager 的权限
INSERT INTO role_hierarchy (parent_role_id, child_role_id)
SELECT p.id, c.id FROM roles p, roles c
WHERE p.name='admin' AND c.name='manager';

-- Manager 继承 Sales 的权限
INSERT INTO role_hierarchy (parent_role_id, child_role_id)
SELECT p.id, c.id FROM roles p, roles c
WHERE p.name='manager' AND c.name='sales';


----------------------------------------------------------------------
-- 3. Positions
----------------------------------------------------------------------

CREATE TABLE positions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  role_id       INTEGER NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 100,
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
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER,
  action        TEXT NOT NULL,
  target_type   TEXT NOT NULL,
  target_id     INTEGER,
  details       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);


----------------------------------------------------------------------
-- 6. Permission Modules
----------------------------------------------------------------------

CREATE TABLE permission_modules (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT
);

INSERT INTO permission_modules (code, name, description) VALUES
('staff',     '员工与角色管理',   '管理内部员工账号、角色与权限'),
('products',  '产品管理',         '管理布料与成衣信息'),
('inventory', '库存与进货',       '管理库存与进货单'),
('orders',    '订单管理',         '零售与团体订单管理'),
('customers', '客户与团体',       '客户信息（含团体 leader 与成员）'),
('reports',   '报表与统计',       '销售、库存、订单报表');


----------------------------------------------------------------------
-- 7. Permissions
----------------------------------------------------------------------

CREATE TABLE permissions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id     INTEGER NOT NULL,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
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
INSERT OR IGNORE INTO permissions (module_id, code, name, description) VALUES
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.view','View Orders','查看订单'),
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.create','Create Order','创建订单'),
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.update','Update Order','更新订单'),
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.cancel','Cancel Order','取消订单'),
((SELECT id FROM permission_modules WHERE code='orders'), 'orders.delete','Delete Order','删除订单');

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
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  address         TEXT,
  wechat          TEXT,
  whatsapp        TEXT,

  password_hash   TEXT,                -- ⭐ 新增：前台顾客需要密码登录
  is_active       INTEGER NOT NULL DEFAULT 1, -- ⭐ 新增：账号是否可用（默认启用）

  type            TEXT NOT NULL DEFAULT 'retail',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_customers_email ON customers(email);


----------------------------------------------------------------------
-- 10. Group Orders / Member
----------------------------------------------------------------------

CREATE TABLE group_orders (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  leader_id         INTEGER NOT NULL,
  leader_name       TEXT NOT NULL,
  leader_phone      TEXT NOT NULL,
  leader_email      TEXT NOT NULL,
  group_name        TEXT NOT NULL,
  event_name        TEXT,
  expected_members  INTEGER,
  fabric_selected   TEXT NOT NULL,
  event_start       TEXT,
  event_end         TEXT,
  notes             TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
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
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  parent_id     INTEGER,
  sort_order    INTEGER NOT NULL DEFAULT 100,
  is_active     INTEGER NOT NULL DEFAULT 1,
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
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  sku             TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  category_id     INTEGER NOT NULL,
  product_type    TEXT NOT NULL,   -- 'fabric' | 'garment'
  material        TEXT,
  pattern         TEXT,
  width_cm        REAL,
  fabric_id       INTEGER,
  style           TEXT,
  gender          TEXT,
  size_label      TEXT,
  color           TEXT,
  unit            TEXT NOT NULL DEFAULT 'piece',
  base_price      REAL NOT NULL,
  cost_price      REAL,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
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
-- 14. Garment Incoming（成衣进货/生产入库）
----------------------------------------------------------------------

CREATE TABLE garment_incoming (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  garment_id      INTEGER NOT NULL,
  quantity        REAL NOT NULL,
  unit_cost       REAL,          -- 成本价，用于利润计算
  batch_id        TEXT,          -- 生产批次或采购批次
  source_type     TEXT NOT NULL DEFAULT 'production', -- 'production' 或 'purchase'
  source_reference TEXT,          -- 对应工单号或采购发票号
  received_at     TEXT NOT NULL DEFAULT (datetime('now')),
  created_by      INTEGER,
  notes           TEXT,
  FOREIGN KEY (garment_id) REFERENCES products(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_garment_incoming_garment ON garment_incoming(garment_id);
CREATE INDEX idx_garment_incoming_date ON garment_incoming(received_at);


----------------------------------------------------------------------
-- 15. Fabric Usage（裁剪用料）
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
-- 16. Product 类型强制触发器（业务安全）
----------------------------------------------------------------------

CREATE TRIGGER trg_fabric_incoming_only_fabric
BEFORE INSERT ON fabric_incoming
FOR EACH ROW
WHEN (SELECT product_type FROM products WHERE id = NEW.fabric_id) != 'fabric'
BEGIN
  SELECT RAISE(ABORT,'fabric_incoming.fabric_id must reference fabric');
END;

CREATE TRIGGER trg_garment_incoming_only_garment
BEFORE INSERT ON garment_incoming
FOR EACH ROW
WHEN (SELECT product_type FROM products WHERE id = NEW.garment_id) != 'garment'
BEGIN
  SELECT RAISE(ABORT,'garment_incoming.garment_id must reference garment');
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
-- 17. Product Images
----------------------------------------------------------------------

CREATE TABLE product_images (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id    INTEGER NOT NULL,
  url           TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 1,
  is_primary    INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);


----------------------------------------------------------------------
-- 18. Size Charts / Items
----------------------------------------------------------------------

CREATE TABLE size_charts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  gender        TEXT,
  category_id   INTEGER,
  notes         TEXT,
  FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

CREATE TABLE size_chart_items (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  chart_id        INTEGER NOT NULL,
  size_label      TEXT NOT NULL,
  chest           REAL,
  waist           REAL,
  hip             REAL,
  height          REAL,
  shoulder        REAL,
  sleeve          REAL,
  inseam          REAL,
  length          REAL,
  notes           TEXT,
  FOREIGN KEY(chart_id) REFERENCES size_charts(id) ON DELETE CASCADE
);


----------------------------------------------------------------------
-- 19. Measurements
----------------------------------------------------------------------

CREATE TABLE measurements (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id         INTEGER,
  group_member_id     INTEGER,
  source              TEXT NOT NULL DEFAULT 'staff',
  unit                TEXT NOT NULL DEFAULT 'cm',
  height              REAL,
  chest               REAL,
  waist               REAL,
  hip                 REAL,
  shoulder_width      REAL,
  sleeve_length       REAL,
  inseam              REAL,
  notes               TEXT,
  measured_by         INTEGER,
  measured_at         TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (group_member_id) REFERENCES group_members(id) ON DELETE CASCADE,
  FOREIGN KEY (measured_by) REFERENCES users(id),
  CHECK ((customer_id IS NOT NULL AND group_member_id IS NULL) OR
         (customer_id IS NULL AND group_member_id IS NOT NULL))
);
CREATE INDEX idx_measurements_customer ON measurements(customer_id);
CREATE INDEX idx_measurements_member ON measurements(group_member_id);


----------------------------------------------------------------------
-- 20. Garment Inventory Table (Bulk Tracking)
----------------------------------------------------------------------

CREATE TABLE stock_levels (
  product_id          INTEGER PRIMARY KEY,
  quantity_on_hand    REAL NOT NULL DEFAULT 0,
  reorder_point       REAL,
  last_updated        TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


----------------------------------------------------------------------
-- 21. Unique Inventory Items（单个追踪/序列号管理）
----------------------------------------------------------------------

CREATE TABLE inventory_items (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id        INTEGER NOT NULL,
    unique_code       TEXT NOT NULL UNIQUE, -- 存储唯一的条形码或序列号
    status            TEXT NOT NULL DEFAULT 'In Stock', -- 'In Stock', 'Sold', 'Damaged', 'Reserved'
    location_id       INTEGER, -- 可选：未来用于货位管理
    received_at       TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    -- FOREIGN KEY (location_id) REFERENCES locations(id) -- 预留给未来的货位表
);
CREATE INDEX idx_inventory_items_product ON inventory_items(product_id);
CREATE INDEX idx_inventory_items_code ON inventory_items(unique_code);


----------------------------------------------------------------------
-- 22. Inventory Transactions（唯一入口）
----------------------------------------------------------------------

CREATE TABLE inventory_transactions (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id          INTEGER NOT NULL,
  transaction_type    TEXT NOT NULL,
  quantity_change     REAL NOT NULL,
  item_id             INTEGER,        -- ⭐ 新增：如果追踪到唯一项，记录其ID
  reference_type      TEXT,
  reference_id        INTEGER,
  reason              TEXT,
  operated_by         INTEGER,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (item_id)    REFERENCES inventory_items(id) ON DELETE SET NULL, -- 允许唯一项被删除
  FOREIGN KEY (operated_by) REFERENCES users(id)
);

CREATE INDEX idx_inventory_trans_product ON inventory_transactions(product_id);


----------------------------------------------------------------------
-- 23. Retail Orders
----------------------------------------------------------------------

CREATE TABLE retail_orders (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number        TEXT NOT NULL UNIQUE,
  customer_id         INTEGER,
  status              TEXT NOT NULL DEFAULT 'pending',
  channel             TEXT NOT NULL DEFAULT 'in_store',
  subtotal            REAL NOT NULL DEFAULT 0,
  discount_amount     REAL NOT NULL DEFAULT 0,
  discount_rate       REAL,
  total_amount        REAL NOT NULL DEFAULT 0,
  deposit_amount      REAL DEFAULT 0,
  deposit_paid        INTEGER NOT NULL DEFAULT 0,
  order_date          TEXT NOT NULL DEFAULT (datetime('now')),
  due_date            TEXT,
  confirmed_date      TEXT,
  completed_date      TEXT,
  created_by          INTEGER,
  confirmed_by        INTEGER,
  notes               TEXT,
  FOREIGN KEY (customer_id)  REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)   REFERENCES users(id),
  FOREIGN KEY (confirmed_by) REFERENCES users(id)
);

CREATE INDEX idx_retail_orders_customer ON retail_orders(customer_id);
CREATE INDEX idx_retail_orders_status ON retail_orders(status);


----------------------------------------------------------------------
-- 24. Retail Order Items
----------------------------------------------------------------------

CREATE TABLE retail_order_items (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id            INTEGER NOT NULL,
  product_id          INTEGER NOT NULL,
  quantity            REAL NOT NULL DEFAULT 1,
  unique_item_id      INTEGER,      -- ⭐ 新增：如果销售唯一追踪的商品，记录 ID
  unit_price          REAL NOT NULL,
  subtotal            REAL NOT NULL,
  product_sku         TEXT,
  product_name        TEXT,
  size_label          TEXT,
  color               TEXT,
  notes               TEXT,
  FOREIGN KEY (order_id)   REFERENCES retail_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (unique_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL -- 允许唯一项被删除
);
CREATE INDEX idx_retail_order_items_order ON retail_order_items(order_id);


----------------------------------------------------------------------
-- 25. ORDER DATES TRIGGER
----------------------------------------------------------------------
CREATE TRIGGER trg_retail_orders_dates
AFTER UPDATE ON retail_orders
FOR EACH ROW
WHEN NEW.status != OLD.status
BEGIN
    UPDATE retail_orders 
    SET confirmed_date = CASE 
        WHEN NEW.status = 'confirmed' AND OLD.status != 'confirmed' 
        THEN datetime('now')
        WHEN NEW.status IN ('pending', 'cancelled')
        THEN NULL
        ELSE confirmed_date
    END,
    completed_date = CASE
        WHEN NEW.status = 'completed' AND OLD.status != 'completed'
        THEN datetime('now')
        WHEN NEW.status IN ('pending', 'cancelled')
        THEN NULL
        ELSE completed_date
    END
    WHERE id = NEW.id;
END;

----------------------------------------------------------------------
-- 26. Group Order Fabrics
----------------------------------------------------------------------

CREATE TABLE group_order_fabrics (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  group_order_id      INTEGER NOT NULL,
  fabric_id           INTEGER NOT NULL,
  is_primary          INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (group_order_id) REFERENCES group_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (fabric_id) REFERENCES products(id)
);
CREATE INDEX idx_group_order_fabrics_order ON group_order_fabrics(group_order_id);


----------------------------------------------------------------------
-- 27. Payments
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
-- 28. Auto-update timestamp triggers
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
-- 29. Production Safety (block stock manipulations)
-- [已禁用] 修正说明：
-- 这里的触发器会导致 "direct stock insert forbidden" 错误。
-- 因为第 33 节的触发器需要自动写入 stock_levels 表，所以不能在这里禁止写入。
-- 如果需要保护数据，请依赖 API 层面的权限控制，而不是数据库触发器。
----------------------------------------------------------------------

-- DROP TRIGGER IF EXISTS trg_block_direct_stock_insert;
-- DROP TRIGGER IF EXISTS trg_block_direct_stock_update;
-- DROP TRIGGER IF EXISTS trg_block_direct_stock_delete;


----------------------------------------------------------------------
-- 30. v_stock_levels（成衣库存视图）
----------------------------------------------------------------------

DROP VIEW IF EXISTS v_stock_levels;

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


-- ----------------------------------------------------------------------
-- -- 31. v_inventory_summary（成衣库存统计视图 - 实时计算）
-- ----------------------------------------------------------------------

-- DROP VIEW IF EXISTS v_inventory_summary;

-- CREATE VIEW v_inventory_summary AS
-- SELECT
--   p.id AS product_id,
--   p.sku,
--   p.name,
--   p.product_type,
--   -- 优先使用 stock_levels 表中的缓存值，如果没有则为 0
--   COALESCE(sl.quantity_on_hand, 0) AS current_stock,
--   -- 统计总入库量
--   COALESCE(SUM(CASE WHEN it.transaction_type='in' THEN it.quantity_change ELSE 0 END),0) AS total_in,
--   -- 统计总出库量 (转换为正数显示)
--   COALESCE(SUM(CASE WHEN it.transaction_type='out' THEN ABS(it.quantity_change) ELSE 0 END),0) AS total_out,
--   -- 交易次数
--   COUNT(it.id) AS transaction_count,
--   -- 最后交易时间
--   MAX(it.created_at) AS last_transaction
-- FROM products p
-- LEFT JOIN stock_levels sl ON sl.product_id = p.id
-- LEFT JOIN inventory_transactions it ON it.product_id = p.id
-- WHERE p.product_type='garment'
-- GROUP BY p.id;

----------------------------------------------------------------------
-- 32. v_fabric_stock（布料库存视图：进货总量 - 裁剪使用总量）
----------------------------------------------------------------------
DROP VIEW IF EXISTS v_fabric_stock;

CREATE VIEW v_fabric_stock AS
WITH incoming AS (
    SELECT 
        fabric_id AS product_id,
        COALESCE(SUM(quantity), 0) AS total_in
    FROM fabric_incoming
    GROUP BY fabric_id
),

usage AS (
    SELECT 
        fabric_id AS product_id,
        COALESCE(SUM(used_quantity), 0) AS total_used
    FROM garment_fabric_usage
    GROUP BY fabric_id
),

last_tx AS (
    -- 合并所有布料相关交易的时间戳，取最新的那一条作为最后异动时间
    SELECT 
        fabric_id, 
        MAX(ts) AS last_transaction_at
    FROM (
        SELECT fabric_id, received_at AS ts FROM fabric_incoming
        UNION ALL
        SELECT fabric_id, used_at      AS ts FROM garment_fabric_usage
    ) AS combined_transactions
    GROUP BY fabric_id
)

SELECT
    p.id                                      AS fabric_id,
    p.sku,
    p.name                                    AS fabric_name,
    p.material,
    p.pattern,
    p.width_cm,

    COALESCE(i.total_in, 0)                   AS total_in,
    COALESCE(u.total_used, 0)                 AS total_used,
    COALESCE(i.total_in, 0) - COALESCE(u.total_used, 0) AS stock_balance,

    -- 最后更新时间：有交易记录取最近交易时间，无记录则取产品创建时间
    COALESCE(t.last_transaction_at, p.created_at) AS last_updated

FROM products p
LEFT JOIN incoming  i ON i.product_id = p.id
LEFT JOIN usage     u ON u.product_id = p.id
LEFT JOIN last_tx   t ON t.fabric_id  = p.id
WHERE p.product_type = 'fabric'
ORDER BY p.sku ASC;

----------------------------------------------------------------------
-- 33. 成衣库存自动同步触发器 (核心逻辑)
----------------------------------------------------------------------

-- ==========================================
-- 1. 成衣入库 (Garment Incoming) -> 更新 Stock Levels
-- ==========================================
DROP TRIGGER IF EXISTS trg_garment_incoming_update_stock;

CREATE TRIGGER trg_garment_incoming_update_stock
AFTER INSERT ON garment_incoming
FOR EACH ROW
BEGIN
    -- 插入或更新库存表
    INSERT INTO stock_levels (product_id, quantity_on_hand, last_updated)
    VALUES (NEW.garment_id, NEW.quantity, datetime('now'))
    ON CONFLICT(product_id) DO UPDATE SET
        quantity_on_hand = quantity_on_hand + NEW.quantity,
        last_updated = datetime('now');

    -- 【可选】如果需要审计，可以在这里也插入 inventory_transactions
    -- 但通常入库本身就有记录，不需要重复插入 transaction
END;

-- ==========================================
-- 2. 零售订单确认 (Confirmed) -> 扣减库存
-- ==========================================
DROP TRIGGER IF EXISTS trg_retail_order_confirm_reduce_stock;

CREATE TRIGGER trg_retail_order_confirm_reduce_stock
AFTER UPDATE ON retail_orders
FOR EACH ROW
WHEN NEW.status = 'confirmed' AND OLD.status != 'confirmed'
BEGIN
    -- 1. 扣减库存 (批量处理订单内所有商品)
    UPDATE stock_levels
    SET 
        quantity_on_hand = quantity_on_hand - (
            SELECT SUM(roi.quantity)
            FROM retail_order_items roi
            WHERE roi.order_id = NEW.id 
            AND roi.product_id = stock_levels.product_id
        ),
        last_updated = datetime('now')
    WHERE product_id IN (
        SELECT DISTINCT product_id 
        FROM retail_order_items 
        WHERE order_id = NEW.id
    );

    -- 2. 插入库存交易流水 (Transaction Log)
    INSERT INTO inventory_transactions (
        product_id, transaction_type, quantity_change, 
        reference_type, reference_id, reason, operated_by, created_at
    )
    SELECT 
        roi.product_id,
        'out',
        -roi.quantity,  -- 负数表示减少
        'retail_order',
        NEW.id,
        'Retail sale confirmed',
        NEW.confirmed_by,
        datetime('now')
    FROM retail_order_items roi
    WHERE roi.order_id = NEW.id;
END;

-- ==========================================
-- 3. 零售订单取消 (Cancelled) -> 回补库存
-- ==========================================
DROP TRIGGER IF EXISTS trg_retail_order_cancel_restore_stock;

CREATE TRIGGER trg_retail_order_cancel_restore_stock
AFTER UPDATE ON retail_orders
FOR EACH ROW
WHEN NEW.status = 'cancelled' AND OLD.status = 'confirmed'
BEGIN
    -- 1. 回补库存
    UPDATE stock_levels
    SET 
        quantity_on_hand = quantity_on_hand + (
            SELECT SUM(roi.quantity)
            FROM retail_order_items roi
            WHERE roi.order_id = NEW.id 
            AND roi.product_id = stock_levels.product_id
        ),
        last_updated = datetime('now')
    WHERE product_id IN (
        SELECT DISTINCT product_id 
        FROM retail_order_items 
        WHERE order_id = NEW.id
    );

    -- 2. 插入回补流水
    INSERT INTO inventory_transactions (
        product_id, transaction_type, quantity_change, 
        reference_type, reference_id, reason, operated_by, created_at
    )
    SELECT 
        roi.product_id,
        'in',
        roi.quantity,   -- 正数表示增加
        'retail_order_cancelled',
        NEW.id,
        'Order cancelled - stock restored',
        NEW.confirmed_by,
        datetime('now')
    FROM retail_order_items roi
    WHERE roi.order_id = NEW.id;
END;

-- ==========================================
-- 4. 手动库存交易 -> 同步更新 Stock Levels
-- (用于 Inventory Adjustment 或盘点)
-- ==========================================
DROP TRIGGER IF EXISTS trg_inventory_trans_update_stock;

CREATE TRIGGER trg_inventory_trans_update_stock
AFTER INSERT ON inventory_transactions
FOR EACH ROW
-- 仅处理成衣，且排除掉上面已经处理过的零售订单，防止双重计算
WHEN NEW.product_id IN (SELECT id FROM products WHERE product_type = 'garment')
AND NEW.reference_type NOT IN ('retail_order', 'retail_order_cancelled')
BEGIN
    INSERT INTO stock_levels (product_id, quantity_on_hand, last_updated)
    VALUES (NEW.product_id, NEW.quantity_change, datetime('now'))
    ON CONFLICT(product_id) DO UPDATE SET
        quantity_on_hand = quantity_on_hand + NEW.quantity_change,
        last_updated = datetime('now');
END;

-- ==========================================
-- 5. 防止库存为负数 (可选，根据业务需求启用)
-- ==========================================
DROP TRIGGER IF EXISTS trg_prevent_negative_stock;

CREATE TRIGGER trg_prevent_negative_stock
BEFORE UPDATE ON stock_levels
FOR EACH ROW
WHEN NEW.quantity_on_hand < 0
BEGIN
    -- 如果允许负库存（允许超卖），请注释掉下面这行
    SELECT RAISE(ABORT, 'Insufficient stock: cannot reduce below zero');
END;

----------------------------------------------------------------------
-- End of init-db.sql