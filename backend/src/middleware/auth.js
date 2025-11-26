// backend\src\middleware\auth.js

import AuthService from '../services/authService.js';
import UsersDAO from '../data/users-dao.js';


/**
 * 从请求中提取 access token
 */
function extractToken(req) {
  return req.cookies?.access_token || req.headers['authorization']?.replace('Bearer ', '');
}

/**
 * 必须登录才能访问
 */
export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // 解 JWT（仅 payload，不查 DB）
    const decoded = AuthService.verifyAccess(token);

    // 根据 decoded.userId 查询用户详细资料（同步）
    const user = UsersDAO.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 检查用户是否被禁用
    if (!user.is_active) {
      return res.status(403).json({ error: 'User disabled' });
    }

    // 检查必须修改密码
    if (user.must_change_password) {
      return res.status(403).json({
        error: 'Password change required',
        must_change_password: true
      });
    }

    // 注入完整用户对象
    req.user = {
      id: user.id,
      full_name: user.full_name,
      position: user.position_name,
      role: user.role_name,
      is_active: user.is_active,
      must_change_password: user.must_change_password
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * 可选登录。
 */
export function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = AuthService.verifyAccess(token);
    const user = UsersDAO.getUserById(decoded.userId);

    if (user && user.is_active) {
      req.user = {
        id: user.id,
        full_name: user.full_name,
        position: user.position_name,
        role: user.role_name,
        is_active: user.is_active,
        must_change_password: user.must_change_password
      };
    }
  } catch (_) {
    // token 无效就忽略
  }

  next();
}
