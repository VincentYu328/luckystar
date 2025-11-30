// backend/src/data/customers-dao.js (修正版 - 兼容同步 better-sqlite3)

import db from '../database/db.js'; // 直接导入同步的 db 实例

class CustomersDAO {

    // =====================================================
    // customers 表
    // 注意：所有方法都移除了 async 和 await
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
        `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
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
        
        // 🔥 确保 is_active 是整数
        const isActive = data.is_active != null ? (data.is_active ? 1 : 0) : 1;
        
        const result = stmt.run(
            data.full_name,
            data.phone,
            data.email,
            data.address || null,
            data.wechat || null,
            data.whatsapp || null,
            data.type || 'retail',
            data.password_hash || null,
            isActive
        );
        return result;
    }

    // =====================================================
    // 更新顾客信息（后台）
    // 🔥 核心修复：处理布尔值转整数
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
        
        // 🔥 关键修复：转换值，特别是 is_active
        const params = keys.map(k => {
            const value = fields[k];
            
            // 如果是 is_active 字段，转换布尔值为整数
            if (k === 'is_active') {
                return value != null ? (value ? 1 : 0) : 1;
            }
            
            // 其他字段保持原样
            return value;
        });
        
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
    // My Profile（顾客端）
    // =====================================================
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
    // My Measurements（顾客端）
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

    // 修复：只更新该客户最新的测量记录（避免误更新多条）
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

        // 先找到最新的 measurement id
        const latest = db.prepare(`
            SELECT id FROM measurements
            WHERE customer_id = ?
            ORDER BY measured_at DESC
            LIMIT 1
        `).get(customerId);

        if (!latest) {
            console.log(`No measurement found for customer ${customerId} to update.`);
            return { changes: 0 };
        }

        params.push(latest.id);

        return db.prepare(`
            UPDATE measurements
            SET ${setClause}
            WHERE id = ?
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
            fields.source || 'customer_portal',
            fields.unit || 'cm',
            fields.height || null,
            fields.chest || null,
            fields.waist || null,
            fields.hip || null,
            fields.shoulder_width || null,
            fields.sleeve_length || null,
            fields.inseam || null,
            fields.notes || null,
            fields.measured_by || null
        );
    }

    // =====================================================
    // My Orders（顾客端）
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
    static getAllGroupOrders() {
        return db.prepare(`
            SELECT
                go.*,
                c.full_name as leader_name,
                c.phone as leader_phone,
                c.email as leader_email,
                COUNT(DISTINCT gm.id) as member_count
            FROM group_orders go
            LEFT JOIN customers c ON go.leader_id = c.id
            LEFT JOIN group_members gm ON go.id = gm.group_order_id
            GROUP BY go.id
            ORDER BY go.created_at DESC
        `).all();
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

    static getGroupOrdersByCustomer(customerId) {
        return db.prepare(`
            SELECT
                go.*,
                c.full_name as leader_name,
                c.phone as leader_phone,
                c.email as leader_email
            FROM group_orders go
            LEFT JOIN customers c ON go.leader_id = c.id
            WHERE go.leader_id = ?
            ORDER BY go.created_at DESC
        `).all(customerId);
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