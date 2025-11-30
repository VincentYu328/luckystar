// backend\src\data\users-dao.js

import db from '../database/db.js';
import bcrypt from 'bcrypt';

class UsersDAO {

    // =====================================================
    // 查询类
    // =====================================================

    static getAllUsers() {
        return db.prepare(`
          SELECT 
            u.*,
            p.name AS position_name,
            r.name AS role_name
          FROM users u
          JOIN positions p ON p.id = u.position_id
          JOIN roles r ON r.id = p.role_id
          ORDER BY u.id ASC
        `).all();
    }

    static getUserById(id) {
        return db.prepare(`
          SELECT 
            u.*,
            p.name AS position_name,
            r.name AS role_name
          FROM users u
          JOIN positions p ON p.id = u.position_id
          JOIN roles r ON r.id = p.role_id
          WHERE u.id = ?
        `).get(id);
    }

    static getUserByEmail(email) {
        return db.prepare(`
          SELECT 
            u.*,
            p.name AS position_name,
            r.name AS role_name
          FROM users u
          JOIN positions p ON p.id = u.position_id
          JOIN roles r ON r.id = p.role_id
          WHERE u.email = ?
        `).get(email);
    }

    static getUserByPhone(phone) {
        return db.prepare(`
          SELECT 
            u.*,
            p.name AS position_name,
            r.name AS role_name
          FROM users u
          JOIN positions p ON p.id = u.position_id
          JOIN roles r ON r.id = p.role_id
          WHERE u.phone = ?
        `).get(phone);
    }

    static getUserByName(name) {
        // 使用参数绑定处理 LIKE 模式，安全且标准
        return db.prepare(`
          SELECT 
            u.*,
            p.name AS position_name,
            r.name AS role_name
          FROM users u
          JOIN positions p ON p.id = u.position_id
          JOIN roles r ON r.id = p.role_id
          WHERE u.full_name LIKE ?
          ORDER BY u.full_name ASC
        `).all(`%${name}%`);
    }

    static getUserRole(userId) {
        return db.prepare(`
          SELECT r.name AS role_name
          FROM users u
          JOIN positions p ON p.id = u.position_id
          JOIN roles r ON r.id = p.role_id
          WHERE u.id = ?
        `).get(userId);
    }

    static getUserPermissions(userId) {
        return db.prepare(`
          SELECT perm.code AS permission
          FROM users u
          JOIN positions pos ON pos.id = u.position_id
          JOIN roles r ON r.id = pos.role_id
          JOIN role_permissions rp ON rp.role_id = r.id
          JOIN permissions perm ON perm.id = rp.permission_id
          WHERE u.id = ?
        `).all(userId).map(row => row.permission);
    }

    // =====================================================
    // 写入类（CRUD）
    // =====================================================

    /** Create: 新增员工 */
    static createUser(userData) {
        const stmt = db.prepare(`
          INSERT INTO users (
            full_name, phone, email, address, wechat, whatsapp,
            position_id, password_hash, must_change_password,
            is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `);

        return stmt.run(
            userData.full_name,
            userData.phone,
            userData.email,
            userData.address,
            userData.wechat,
            userData.whatsapp,
            userData.position_id,
            userData.password_hash,
            userData.must_change_password ?? 1,
            userData.is_active ?? 1
        );
    }

    /** Update: 修改员工资料（部分字段更新） */
    static updateUser(id, fields) {
        const allowed = [
            'full_name', 'phone', 'email', 'address', 'wechat',
            'whatsapp', 'position_id', 'is_active'
        ];

        const keys = Object.keys(fields).filter(k => allowed.includes(k));
        if (keys.length === 0) return { changes: 0 }; // 返回 0 变化

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const params = keys.map(k => fields[k]);
        
        // ⭐ 修正点：将 updated_at 直接包含在 SET 子句中
        const fullSetClause = `${setClause}, updated_at = datetime('now')`; 

        params.push(id); // 最后的参数是 WHERE id = ?

        return db.prepare(`
          UPDATE users
          SET ${fullSetClause}
          WHERE id = ?
        `).run(...params);
    }

    /** Delete: 删除用户 */
    static deleteUser(id) {
        return db.prepare(`
          DELETE FROM users WHERE id = ?
        `).run(id);
    }

    /** 单独修改账号启用/禁用状态 */
    static setActiveStatus(id, isActive) {
        return db.prepare(`
          UPDATE users
          SET is_active = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(isActive, id);
    }

    /** 密码更新 */
    static updatePassword(id, newHash) {
        return db.prepare(`
          UPDATE users
          SET password_hash = ?, must_change_password = 0,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(newHash, id);
    }

    /** 强制下次登录修改密码 */
    static setMustChangePassword(id) {
        return db.prepare(`
          UPDATE users
          SET must_change_password = 1,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(id);
    }

    /** 管理员强制重置密码 */
    static forceResetPassword(id, newHash) {
        return db.prepare(`
          UPDATE users
          SET password_hash = ?, must_change_password = 1,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(newHash, id);
    }

    // =====================================================
    // 工具类
    // =====================================================

    static verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    static logAction({ userId, action, targetType, targetId, details }) {
        return db.prepare(`
          INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
          VALUES (?, ?, ?, ?, ?)
        `).run(
            userId,
            action,
            targetType,
            targetId,
            details ? JSON.stringify(details) : null
        );
    }

    // ===========================
    // 更新最后登录时间
    // ===========================
    static updateLoginTimestamp(userId) {
        const stmt = db.prepare(`
        UPDATE users
        SET last_login = datetime('now'),
            updated_at = datetime('now') 
        WHERE id = ?
      `);
        return stmt.run(userId);
    }
}

export default UsersDAO;