// backend/src/data/payments-dao.js
import db from '../database/db.js';

class PaymentsDAO {

  // =====================================================
  // 基础查询
  // =====================================================

  static getById(id) {
    return db.prepare(`
      SELECT
        p.*,
        u_received.full_name AS received_by_name,
        u_verified.full_name AS verified_by_name
      FROM payments p
      LEFT JOIN users u_received ON p.received_by = u_received.id
      LEFT JOIN users u_verified ON p.verified_by = u_verified.id
      WHERE p.id = ?
    `).get(id);
  }

  static getByOrder(orderType, orderId) {
    return db.prepare(`
      SELECT
        p.*,
        u_received.full_name AS received_by_name,
        u_verified.full_name AS verified_by_name
      FROM payments p
      LEFT JOIN users u_received ON p.received_by = u_received.id
      LEFT JOIN users u_verified ON p.verified_by = u_verified.id
      WHERE p.order_type = ? AND p.order_id = ?
      ORDER BY p.payment_date ASC
    `).all(orderType, orderId);
  }

  static getAll() {
    return db.prepare(`
      SELECT
        p.*,
        u_received.full_name AS received_by_name,
        u_verified.full_name AS verified_by_name
      FROM payments p
      LEFT JOIN users u_received ON p.received_by = u_received.id
      LEFT JOIN users u_verified ON p.verified_by = u_verified.id
      ORDER BY p.payment_date DESC
    `).all();
  }

  // =====================================================
  // 创建付款记录
  // =====================================================

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO payments (
        order_type,
        order_id,
        payment_type,
        payment_method,
        amount,
        transfer_reference,
        notes,
        received_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      data.order_type,
      data.order_id,
      data.payment_type,
      data.payment_method,
      data.amount,
      data.transfer_reference || null,
      data.notes || null,
      data.received_by || null
    );
  }

  // =====================================================
  // 更新（用于银行转账 verify）
  // =====================================================

  static verifyTransfer(id, adminId) {
    return db.prepare(`
      UPDATE payments
      SET transfer_verified = 1,
          verified_by = ?,
          verified_date = datetime('now')
      WHERE id = ?
    `).run(adminId, id);
  }
}

export default PaymentsDAO;
