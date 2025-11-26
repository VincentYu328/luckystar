// backend/src/data/retail-orders-dao.js
import db from '../database/db.js';

class RetailOrdersDAO {

  // =====================================================
  // 1. 基本查询（主表 retail_orders）
  // =====================================================

  static getAllOrders() {
    return db.prepare(`
      SELECT ro.*, c.full_name AS customer_name
      FROM retail_orders ro
      LEFT JOIN customers c ON c.id = ro.customer_id
      ORDER BY ro.id DESC
    `).all();
  }

  static getOrderById(orderId) {
    return db.prepare(`
      SELECT ro.*, c.full_name AS customer_name
      FROM retail_orders ro
      LEFT JOIN customers c ON c.id = ro.customer_id
      WHERE ro.id = ?
    `).get(orderId);
  }

  static getOrderByNumber(orderNumber) {
    return db.prepare(`
      SELECT *
      FROM retail_orders
      WHERE order_number = ?
    `).get(orderNumber);
  }

  static getOrdersByCustomer(customerId) {
    return db.prepare(`
      SELECT *
      FROM retail_orders
      WHERE customer_id = ?
      ORDER BY id DESC
    `).all(customerId);
  }


  // =====================================================
  // 2. 创建订单（主表）
  // =====================================================

  static createOrder(data) {
    const stmt = db.prepare(`
      INSERT INTO retail_orders (
        order_number,
        customer_id,
        status,
        channel,
        subtotal,
        discount_amount,
        discount_rate,
        total_amount,
        deposit_amount,
        deposit_paid,
        order_date,
        due_date,
        confirmed_date,
        completed_date,
        created_by,
        confirmed_by,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.order_number,
      data.customer_id || null,
      data.status || 'pending',
      data.channel || 'in_store',
      data.subtotal ?? 0,
      data.discount_amount ?? 0,
      data.discount_rate || null,
      data.total_amount ?? 0,
      data.deposit_amount || 0,
      data.deposit_paid ?? 0,
      data.order_date || new Date().toISOString(),
      data.due_date || null,
      data.confirmed_date || null,
      data.completed_date || null,
      data.created_by || null,
      data.confirmed_by || null,
      data.notes || null
    );

    return result;
  }


  // =====================================================
  // 3. 更新订单（主表）
  // =====================================================

  static updateOrder(orderId, fields) {
    const allowed = [
      'customer_id', 'status', 'channel',
      'subtotal', 'discount_amount', 'discount_rate',
      'total_amount', 'deposit_amount', 'deposit_paid',
      'order_date', 'due_date', 'confirmed_date', 'completed_date',
      'created_by', 'confirmed_by', 'notes'
    ];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);

    params.push(orderId);

    return db.prepare(`
      UPDATE retail_orders
      SET ${setClause}
      WHERE id = ?
    `).run(...params);
  }


  // =====================================================
  // 4. 删除订单（Cascade 删除 order_items）
  // =====================================================

  static deleteOrder(orderId) {
    return db.prepare(`
      DELETE FROM retail_orders WHERE id = ?
    `).run(orderId);
  }


  // =====================================================
  // 5. Order Items（子表 retail_order_items）
  // =====================================================

  static getItemsByOrder(orderId) {
    return db.prepare(`
      SELECT roi.*, p.sku AS original_sku
      FROM retail_order_items roi
      LEFT JOIN products p ON p.id = roi.product_id
      WHERE roi.order_id = ?
      ORDER BY roi.id ASC
    `).all(orderId);
  }

  static getItemById(id) {
    return db.prepare(`
      SELECT *
      FROM retail_order_items
      WHERE id = ?
    `).get(id);
  }

  static createItem(data) {
    const stmt = db.prepare(`
      INSERT INTO retail_order_items (
        order_id,
        product_id,
        quantity,
        unit_price,
        subtotal,
        product_sku,
        product_name,
        size_label,
        color,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      data.order_id,
      data.product_id,
      data.quantity,
      data.unit_price,
      data.subtotal,
      data.product_sku || null,
      data.product_name || null,
      data.size_label || null,
      data.color || null,
      data.notes || null
    );
  }

  static updateItem(itemId, fields) {
    const allowed = [
      'quantity', 'unit_price', 'subtotal',
      'product_sku', 'product_name',
      'size_label', 'color', 'notes'
    ];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(itemId);

    return db.prepare(`
      UPDATE retail_order_items
      SET ${setClause}
      WHERE id = ?
    `).run(...params);
  }

  static deleteItem(itemId) {
    return db.prepare(`
      DELETE FROM retail_order_items WHERE id = ?
    `).run(itemId);
  }
}

export default RetailOrdersDAO;
