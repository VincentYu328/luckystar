import UsersDAO from '../data/users-dao.js';

/**
 * 检查角色（支持继承关系）
 */
export function requireRole(allowedRoles) {
  if (!Array.isArray(allowedRoles)) {
    allowedRoles = [allowedRoles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { role } = req.user;

    // 角色本身允许
    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      error: 'Insufficient role privilege'
    });
  };
}

/**
 * 检查权限节点
 */
export function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const permissions = UsersDAO.getUserPermissions(req.user.id);

    if (permissions.includes(permissionCode)) {
      return next();
    }

    return res.status(403).json({
      error: 'Permission denied',
      missing_permission: permissionCode
    });
  };
}
