// backend/src/data/measurements-dao.js
import db from '../database/db.js';

class MeasurementsDAO {

  // =====================================================
  // 基本查询
  // =====================================================

  // 获取某客户的全部量体记录
  static getByCustomer(customerId) {
    return db.prepare(`
      SELECT *
      FROM measurements
      WHERE customer_id = ?
      ORDER BY measured_at DESC
    `).all(customerId);
  }

  // 获取某团体成员的全部量体记录
  static getByGroupMember(groupMemberId) {
    return db.prepare(`
      SELECT *
      FROM measurements
      WHERE group_member_id = ?
      ORDER BY measured_at DESC
    `).all(groupMemberId);
  }

  // 根据 id 查询单条记录
  static getById(id) {
    return db.prepare(`
      SELECT *
      FROM measurements
      WHERE id = ?
    `).get(id);
  }

  // =====================================================
  // 创建 measurement
  // =====================================================

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO measurements (
        customer_id,
        group_member_id,
        source,
        unit,
        height,
        chest,
        waist,
        hip,
        shoulder_width,
        sleeve_length,
        inseam,
        notes,
        measured_by,
        measured_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    return stmt.run(
      data.customer_id || null,
      data.group_member_id || null,
      data.source || 'staff',
      data.unit || 'cm',
      data.height || null,
      data.chest || null,
      data.waist || null,
      data.hip || null,
      data.shoulder_width || null,
      data.sleeve_length || null,
      data.inseam || null,
      data.notes || null,
      data.measured_by || null
    );
  }

  // =====================================================
  // 更新 measurement
  // =====================================================

  static update(id, fields) {
    const allowed = [
      'source', 'unit',
      'height', 'chest', 'waist', 'hip',
      'shoulder_width', 'sleeve_length', 'inseam',
      'notes'
    ];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return;

    const clause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);

    params.push(id);

    return db.prepare(`
      UPDATE measurements
      SET ${clause},
          measured_at = measured_at  -- 时间不自动更新
      WHERE id = ?
    `).run(...params);
  }

  // =====================================================
  // 删除 measurement
  // =====================================================

  static delete(id) {
    return db.prepare(`
      DELETE FROM measurements
      WHERE id = ?
    `).run(id);
  }

}

export default MeasurementsDAO;
