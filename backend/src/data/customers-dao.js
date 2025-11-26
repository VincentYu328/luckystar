// backend/src/data/customers-dao.js
import db from '../database/db.js';
import bcrypt from 'bcrypt';

class CustomersDAO {

  // =====================================================
  // customers 表
  // =====================================================

  static getAllCustomers() {
    return db.prepare(`
      SELECT *
      FROM customers
      ORDER BY id DESC
    `).all();
  }

  static getCustomerById(id) {
    return db.prepare(`
      SELECT *
      FROM customers
      WHERE id = ?
    `).get(id);
  }

  static getCustomerByEmail(email) {
    return db.prepare(`
      SELECT *
      FROM customers
      WHERE email = ?
    `).get(email);
  }

  static getCustomerByPhone(phone) {
    return db.prepare(`
      SELECT *
      FROM customers
      WHERE phone = ?
    `).get(phone);
  }

  static searchCustomers(keyword) {
    return db.prepare(`
      SELECT *
      FROM customers
      WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ?
      ORDER BY id DESC
    `).all(
      `%${keyword}%`,
      `%${keyword}%`,
      `%${keyword}%`
    );
  }

  // =====================================================
  // 创建顾客（网站注册 / 后台新增）
  // =====================================================
  static createCustomer(data) {
    const stmt = db.prepare(`
      INSERT INTO customers (
        full_name, phone, email, address,
        wechat, whatsapp, type,
        password_hash, is_active,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(
      data.full_name,
      data.phone,
      data.email,
      data.address || null,
      data.wechat || null,
      data.whatsapp || null,
      data.type || 'retail',
      data.password_hash || null,
      data.is_active ?? 1
    );

    return result;
  }

  // =====================================================
  // 更新顾客信息（后台）
  // =====================================================
  static updateCustomer(id, fields) {
    const allowed = [
      'full_name', 'phone', 'email', 'address',
      'wechat', 'whatsapp', 'type',
      'password_hash', 'is_active'
    ];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (keys.length === 0) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    return db.prepare(`
      UPDATE customers
      SET ${setClause},
          updated_at = datetime('now')
      WHERE id = ?
    `).run(...params);
  }

  static deleteCustomer(id) {
    return db.prepare(`
      DELETE FROM customers WHERE id = ?
    `).run(id);
  }


  // =====================================================
  // ========= ⭐⭐ My Profile（顾客端）⭐⭐ =========
  // =====================================================

  // 用户基本 profile
  static getBasicProfile(customerId) {
    return db.prepare(`
      SELECT
        id,
        full_name,
        phone,
        email,
        address,
        wechat,
        whatsapp,
        is_active,
        type,
        created_at,
        updated_at
      FROM customers
      WHERE id = ?
    `).get(customerId);
  }

  static updateBasicProfile(customerId, fields) {
    const allowed = ['full_name', 'phone', 'address', 'wechat', 'whatsapp'];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(customerId);

    return db.prepare(`
      UPDATE customers
      SET ${setClause},
          updated_at = datetime('now')
      WHERE id = ?
    `).run(...params);
  }


  // =====================================================
  // ========= ⭐⭐ My Measurements（顾客端）⭐⭐ =========
  // =====================================================

  static getMyMeasurements(customerId) {
    return db.prepare(`
      SELECT
        id,
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
      FROM measurements
      WHERE customer_id = ?
      ORDER BY measured_at DESC
      LIMIT 1
    `).get(customerId);
  }

  static updateMyMeasurements(customerId, fields) {
    const allowed = [
      'height', 'chest', 'waist', 'hip',
      'shoulder_width', 'sleeve_length',
      'inseam', 'notes'
    ];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(customerId);

    return db.prepare(`
      UPDATE measurements
      SET ${setClause}
      WHERE customer_id = ?
    `).run(...params);
  }


  static createMyMeasurements(customerId, fields) {
    return db.prepare(`
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
      ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      customerId,
      'customer_portal',
      'cm',
      fields.height || null,
      fields.chest || null,
      fields.waist || null,
      fields.hip || null,
      fields.shoulder_width || null,
      fields.sleeve_length || null,
      fields.inseam || null,
      fields.notes || null,
      'customer_self'
    );
  }


  // =====================================================
  // ========= ⭐⭐ My Orders（顾客端）⭐⭐ =========
  // =====================================================

  static getMyRetailOrders(customerId) {
    return db.prepare(`
      SELECT
        id,
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
        notes
      FROM retail_orders
      WHERE customer_id = ?
      ORDER BY id DESC
    `).all(customerId);
  }

  static getRetailOrderItems(orderId) {
    return db.prepare(`
      SELECT
        id,
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
      FROM retail_order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `).all(orderId);
  }


  // =====================================================
  // group_orders 表
  // =====================================================

  static getGroupOrdersByCustomer(customerId) {
    return db.prepare(`
      SELECT *
      FROM group_orders
      WHERE leader_id = ?
      ORDER BY id DESC
    `).all(customerId);
  }

  static getGroupOrderById(orderId) {
    return db.prepare(`
      SELECT *
      FROM group_orders
      WHERE id = ?
    `).get(orderId);
  }

  static createGroupOrder(data) {
    const stmt = db.prepare(`
      INSERT INTO group_orders (
        leader_id, leader_name, leader_phone, leader_email,
        group_name, event_name, expected_members,
        fabric_selected, event_start, event_end,
        notes, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    return stmt.run(
      data.leader_id,
      data.leader_name,
      data.leader_phone,
      data.leader_email,
      data.group_name,
      data.event_name || null,
      data.expected_members || null,
      data.fabric_selected,
      data.event_start || null,
      data.event_end || null,
      data.notes || null
    );
  }

  static updateGroupOrder(orderId, fields) {
    const allowed = [
      'group_name', 'event_name', 'expected_members',
      'fabric_selected', 'event_start', 'event_end', 'notes'
    ];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (keys.length === 0) return;

    const clause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(orderId);

    return db.prepare(`
      UPDATE group_orders
      SET ${clause}
      WHERE id = ?
    `).run(...params);
  }

  static deleteGroupOrder(orderId) {
    return db.prepare(`
      DELETE FROM group_orders WHERE id = ?
    `).run(orderId);
  }


  // =====================================================
  // group_members 表
  // =====================================================

  static getGroupMembers(orderId) {
    return db.prepare(`
      SELECT *
      FROM group_members
      WHERE group_order_id = ?
      ORDER BY id ASC
    `).all(orderId);
  }

  static getGroupMemberById(id) {
    return db.prepare(`
      SELECT *
      FROM group_members
      WHERE id = ?
    `).get(id);
  }

  static createGroupMember(data) {
    const stmt = db.prepare(`
      INSERT INTO group_members (
        group_order_id, customer_id,
        full_name, phone, email, note
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      data.group_order_id,
      data.customer_id || null,
      data.full_name,
      data.phone,
      data.email || null,
      data.note || null
    );
  }

  static updateGroupMember(id, fields) {
    const allowed = ['full_name', 'phone', 'email', 'note', 'customer_id'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    return db.prepare(`
      UPDATE group_members
      SET ${setClause}
      WHERE id = ?
    `).run(...params);
  }

  static deleteGroupMember(id) {
    return db.prepare(`
      DELETE FROM group_members WHERE id = ?
    `).run(id);
  }

}

export default CustomersDAO;
