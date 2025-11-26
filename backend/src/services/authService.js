// backend/src/services/authService.js
import UsersDAO from '../data/users-dao.js';
import bcrypt from 'bcrypt';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../utils/jwt.js';

class AuthService {

  // =====================================================
  // Token 生成
  // =====================================================
static issueTokens(user) {
    return {
      accessToken: signAccessToken({
        userId: user.id,
        role: user.role_name,
        full_name: user.full_name,
        email: user.email
      }),
      refreshToken: signRefreshToken({
        userId: user.id
      })
    };
  }

  // =====================================================
  // 登录
  // =====================================================
  static async login(email, password) {
    const user = UsersDAO.getUserByEmail(email);

    // 用户不存在
    if (!user) {
      UsersDAO.logAction({
        userId: null,
        action: 'login_failed',
        targetType: 'auth',
        targetId: null,
        details: { email }
      });
      throw new Error('Invalid email or password');
    }

    // 禁用账号
    if (!user.is_active) {
      UsersDAO.logAction({
        userId: user.id,
        action: 'login_denied_inactive',
        targetType: 'user',
        targetId: user.id,
        details: { email }
      });
      throw new Error('User is disabled');
    }

    // 密码校验
    const ok = await UsersDAO.verifyPassword(password, user.password_hash);
    if (!ok) {
      UsersDAO.logAction({
        userId: user.id,
        action: 'login_failed_password',
        targetType: 'auth',
        targetId: user.id,
        details: { email }
      });
      throw new Error('Invalid email or password');
    }


    UsersDAO.logAction({
      userId: user.id,
      action: 'login_success',
      targetType: 'user',
      targetId: user.id,
      details: { email }
    });

    const tokens = this.issueTokens(user);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        position: user.position_name,
        role: user.role_name,
        must_change_password: user.must_change_password
      },
      tokens
    };
  }

  // =====================================================
  // 修改密码
  // =====================================================
  static async changePassword(userId, oldPassword, newPassword) {
    const user = UsersDAO.getUserById(userId);
    if (!user) throw new Error('User not found');

    const ok = await UsersDAO.verifyPassword(oldPassword, user.password_hash);
    if (!ok) {
      UsersDAO.logAction({
        userId,
        action: 'password_change_failed_wrong_old_password',
        targetType: 'user',
        targetId: userId,
        details: null
      });
      throw new Error('Old password incorrect');
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    UsersDAO.updatePassword(userId, newHash);

    UsersDAO.logAction({
      userId,
      action: 'password_changed',
      targetType: 'user',
      targetId: userId,
      details: null
    });

    return { success: true };
  }

  // =====================================================
  // 管理员强制重置密码
  // =====================================================
  static async adminForceResetPassword(adminUserId, targetUserId, newPassword) {
    const admin = UsersDAO.getUserById(adminUserId);

    if (!admin || admin.role_name !== 'admin') {
      UsersDAO.logAction({
        userId: adminUserId,
        action: 'force_reset_denied_not_admin',
        targetType: 'user',
        targetId: targetUserId,
        details: { attempted_by: adminUserId }
      });
      throw new Error('Only admin can reset user passwords');
    }

    const target = UsersDAO.getUserById(targetUserId);
    if (!target) throw new Error('User not found');

    const newHash = await bcrypt.hash(newPassword, 10);
    UsersDAO.forceResetPassword(targetUserId, newHash);

    UsersDAO.logAction({
      userId: adminUserId,
      action: 'admin_force_reset_password',
      targetType: 'user',
      targetId: targetUserId,
      details: { by: adminUserId }
    });

    return { success: true };
  }

  // =====================================================
  // 强制下次登录修改密码
  // =====================================================
  static requirePasswordChange(userId) {
    UsersDAO.setMustChangePassword(userId);

    UsersDAO.logAction({
      userId,
      action: 'flag_must_change_password',
      targetType: 'user',
      targetId: userId,
      details: null
    });

    return { success: true };
  }

  // =====================================================
  // 校验 AccessToken
  // =====================================================
  static verifyAccess(token) {
    return verifyAccessToken(token);
  }

  // =====================================================
  // 刷新 Access Token
  // =====================================================
  static refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = UsersDAO.getUserById(decoded.userId);

    if (!user) throw new Error('User not found');

    const newToken = signAccessToken({
      userId: user.id,
      role: user.role_name,
      full_name: user.full_name,
      email: user.email
    });

    UsersDAO.logAction({
      userId: user.id,
      action: 'token_refreshed',
      targetType: 'auth',
      targetId: user.id,
      details: null
    });

    return {
      accessToken: newToken
    };
  }

  // =====================================================
  // 用户禁用检查
  // =====================================================
  static validateUserActive(user) {
    if (!user || !user.is_active) {
      throw new Error('User is disabled');
    }
  }
}

export default AuthService;
