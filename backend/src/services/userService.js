// backend/src/services/userService.js
import UsersDAO from '../data/users-dao.js';
import bcrypt from 'bcrypt';

class UserService {

  // =====================================================
  // 获取所有员工
  // =====================================================
  static getAllUsers() {
    if (!UsersDAO.getAllUsers) {
      throw new Error('UsersDAO.getAllUsers() is not implemented');
    }
    return UsersDAO.getAllUsers();
  }

  // =====================================================
  // 获取单个员工
  // =====================================================
  static getUserById(userId) {
    const user = UsersDAO.getUserById(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    return user;
  }

  // =====================================================
  // 创建员工（由 Admin 调用）
  // =====================================================
  static async createUser(adminId, payload) {
    const {
      full_name,
      phone,
      email,
      position_id,
      password,
      address,
      wechat,
      whatsapp
    } = payload;

    // 基础字段检查
    if (!full_name || !phone || !email || !position_id || !password) {
      throw new Error('Missing required fields');
    }

    // 加密密码
    const hash = await bcrypt.hash(password, 10);

    // 创建用户
    const result = UsersDAO.createUser({
      full_name,
      phone,
      email,
      position_id,
      password_hash: hash,
      address: address || null,
      wechat: wechat || null,
      whatsapp: whatsapp || null
    });

    // 审计
    UsersDAO.logAction({
      userId: adminId,
      action: 'user_created',
      targetType: 'user',
      targetId: result.lastInsertRowid,
      details: {
        full_name,
        phone,
        email,
        position_id
      }
    });

    return {
      success: true,
      id: result.lastInsertRowid
    };
  }

  // =====================================================
  // 更新员工信息（Admin）
  // =====================================================
  static updateUser(adminId, targetId, fields) {
    const existing = UsersDAO.getUserById(targetId);
    if (!existing) throw new Error('User not found');

    UsersDAO.updateUser(targetId, fields);

    UsersDAO.logAction({
      userId: adminId,
      action: 'user_updated',
      targetType: 'user',
      targetId,
      details: fields
    });

    return { success: true };
  }

  // =====================================================
  // 启用员工账号
  // =====================================================
  static activateUser(adminId, targetId) {
    UsersDAO.setActiveStatus(targetId, 1);

    UsersDAO.logAction({
      userId: adminId,
      action: 'user_activated',
      targetType: 'user',
      targetId,
      details: { is_active: 1 }
    });

    return { success: true };
  }

  // =====================================================
  // 禁用员工账号
  // =====================================================
  static deactivateUser(adminId, targetId) {
    UsersDAO.setActiveStatus(targetId, 0);

    UsersDAO.logAction({
      userId: adminId,
      action: 'user_deactivated',
      targetType: 'user',
      targetId,
      details: { is_active: 0 }
    });

    return { success: true };
  }

  // =====================================================
  // 强制员工下次登录改密码
  // =====================================================
  static requirePasswordChange(adminId, targetId) {
    UsersDAO.setMustChangePassword(targetId);

    UsersDAO.logAction({
      userId: adminId,
      action: 'flag_must_change_password',
      targetType: 'user',
      targetId,
      details: null
    });

    return { success: true };
  }

  // =====================================================
  // Admin 强制重设员工密码
  // =====================================================
  static async adminResetPassword(adminId, targetId, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password too short');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    UsersDAO.forceResetPassword(targetId, hash);

    UsersDAO.logAction({
      userId: adminId,
      action: 'admin_force_reset_password',
      targetType: 'user',
      targetId,
      details: null
    });

    return { success: true };
  }
}

export default UserService;
