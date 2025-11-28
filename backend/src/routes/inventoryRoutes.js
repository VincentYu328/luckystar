// backend/src/routes/inventoryRoutes.js
// ===============================================
// LuckyStar — Inventory Routes (Fabric + Garment)
// Version: 2025-11
// ===============================================

import express from 'express';
import db from '../database/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/* ======================================================
   Helper: 统一 JSON 输出格式（SSR 必须 items 数组稳定）
====================================================== */
function okItems(rows) {
  return { items: Array.isArray(rows) ? rows : [] };
}

function ok(data = {}) {
  return { success: true, ...data };
}

function bad(res, msg) {
  return res.status(400).json({ error: msg });
}


/* ======================================================
   GET /api/inventory/fabric
   来自 v_fabric_stock
====================================================== */
router.get('/fabric', requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT *
      FROM v_fabric_stock
      ORDER BY fabric_name
    `).all();

    return res.json(okItems(rows));
  } catch (err) {
    console.error("GET /inventory/fabric failed:", err);
    return res.status(500).json({ error: 'DB query failed' });
  }
});


/* ======================================================
   GET /api/inventory/garments
   来自 v_stock_levels
====================================================== */
router.get('/garments', requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT *
      FROM v_stock_levels
      ORDER BY product_name
    `).all();

    return res.json(okItems(rows));
  } catch (err) {
    console.error("GET /inventory/garments failed:", err);
    return res.status(500).json({ error: 'DB query failed' });
  }
});


/* ======================================================
   GET /api/inventory/transactions
   inventory_transactions + 产品名 + 操作者
====================================================== */
router.get('/transactions', requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        it.id,
        it.product_id,
        p.sku,
        p.name AS product_name,
        it.transaction_type,
        it.quantity_change,
        it.reference_type,
        it.reference_id,
        it.reason,
        it.operated_by,
        u.full_name AS operated_by_name,
        it.created_at
      FROM inventory_transactions it
      JOIN products p ON p.id = it.product_id
      LEFT JOIN users u ON u.id = it.operated_by
      ORDER BY it.created_at DESC
    `).all();

    return res.json(okItems(rows));
  } catch (err) {
    console.error("GET /inventory/transactions failed:", err);
    return res.status(500).json({ error: 'DB query failed' });
  }
});


/* ======================================================
   POST /api/inventory/in
   布料入库（fabric_incoming）
====================================================== */
router.post('/in', requireAuth, (req, res) => {
  const { fabric_id, quantity, unit_price, supplier_name, invoice_number, notes } = req.body;

  if (!fabric_id || !quantity) {
    return bad(res, 'fabric_id and quantity required');
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO fabric_incoming (
        fabric_id, quantity, unit_price, supplier_name,
        invoice_number, created_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      fabric_id,
      quantity,
      unit_price ?? null,
      supplier_name ?? null,
      invoice_number ?? null,
      req.user.id,
      notes ?? null
    );

    return res.json(ok({ id: result.lastInsertRowid }));
  } catch (err) {
    console.error("POST /inventory/in failed:", err);
    return res.status(500).json({ error: err.message });
  }
});


/* ======================================================
   POST /api/inventory/out
   布料使用（garment_fabric_usage）
====================================================== */
router.post('/out', requireAuth, (req, res) => {
  const { fabric_id, garment_id, used_quantity, notes } = req.body;

  if (!fabric_id || !used_quantity) {
    return bad(res, 'fabric_id and used_quantity required');
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO garment_fabric_usage (
        fabric_id, garment_id, used_quantity, operated_by, notes
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      fabric_id,
      garment_id ?? null,
      used_quantity,        // 数量为正，视图会自动统计
      req.user.id,
      notes ?? null
    );

    return res.json(ok({ id: result.lastInsertRowid }));
  } catch (err) {
    console.error("POST /inventory/out failed:", err);
    return res.status(500).json({ error: err.message });
  }
});


/* ======================================================
   POST /api/inventory/adjust
   强制库存调整（管理员） — 安全版
====================================================== */
router.post('/adjust', requireAuth, (req, res) => {
  const { product_id, new_quantity, reason } = req.body;

  if (!product_id || new_quantity === undefined) {
    return bad(res, 'product_id and new_quantity required');
  }

  try {
    // ① 读取旧库存
    const row = db.prepare(`
      SELECT quantity_on_hand
      FROM stock_levels
      WHERE product_id = ?
    `).get(product_id);

    const old_qty = row?.quantity_on_hand ?? 0;
    const change = Number(new_quantity) - Number(old_qty);

    // ② 写入 inventory_transactions（唯一允许改库存的入口）
    const result = db.prepare(`
      INSERT INTO inventory_transactions (
        product_id,
        transaction_type,
        quantity_change,
        reason,
        operated_by
      ) VALUES (?, 'adjust', ?, ?, ?)
    `).run(
      product_id,
      change,
      reason ?? null,
      req.user.id
    );

    // ③ ❗禁止直接更新 stock_levels（让触发器执行）
    //    --> 删除下面整个手动更新 block
    //
    // db.prepare(`
    //   INSERT INTO stock_levels ...
    // `).run(...)

    return res.json(ok({
      old_quantity: old_qty,
      new_quantity
    }));

  } catch (err) {
    console.error("POST /inventory/adjust failed:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
