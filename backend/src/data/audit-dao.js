// backend/src/data/audit-dao.js
import db from '../database/db.js';

class AuditDAO {

  // =====================================================
  // 写入日志（内部由 UsersDAO.logAction 调用）
  // =====================================================
  static createLog({ userId, action, targetType, targetId, details }) {
    return db.prepare(`
      INSERT INTO audit_logs (
        user_id,
        action,
        target_type,
        target_id,
        details,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(
      userId,
      action,
      targetType || null,
      targetId || null,
      details ? JSON.stringify(details) : null
    );
  }

  // =====================================================
  // 按 ID 查询
  // =====================================================
  static getById(id) {
    return db.prepare(`
      SELECT al.*, u.full_name AS user_name, u.email AS user_email
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.id = ?
    `).get(id);
  }

  // =====================================================
  // 查询所有日志（按时间倒序）
  // =====================================================
  static getAll() {
    return db.prepare(`
      SELECT al.*, u.full_name AS user_name, u.email AS user_email
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      ORDER BY al.id DESC
    `).all();
  }

  // =====================================================
  // 查询某个用户的日志
  // =====================================================
  static getByUser(userId) {
    return db.prepare(`
      SELECT *
      FROM audit_logs
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId);
  }

  // =====================================================
  // 按 action 过滤，例如 payment_created, transfer_verified
  // =====================================================
  static getByAction(action) {
    return db.prepare(`
      SELECT *
      FROM audit_logs
      WHERE action = ?
      ORDER BY id DESC
    `).all(action);
  }

  // =====================================================
  // 查询与某订单相关的日志
  // （例如零售订单：target_type='retail_order'）
  // =====================================================
  static getByTarget(targetType, targetId) {
    return db.prepare(`
      SELECT *
      FROM audit_logs
      WHERE target_type = ?
        AND target_id = ?
      ORDER BY id DESC
    `).all(targetType, targetId);
  }

}

export default AuditDAO;
