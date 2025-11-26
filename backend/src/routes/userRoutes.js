// backend/src/routes/userRoutes.js
import express from 'express';
import UsersDAO from '../data/users-dao.js';
import bcrypt from 'bcrypt';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /users - 获取所有员工（ADMIN ONLY）
 */
router.get('/', requireAuth, requireRole('admin'), (req, res) => {
  const users = UsersDAO.getAllUsers?.() || [];

  return res.json({
    count: users.length,
    users
  });
});

/**
 * GET /users/:id - 获取单个员工（ADMIN ONLY）
 */
router.get('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  const user = UsersDAO.getUserById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json(user);
});

/**
 * POST /users - 创建员工（ADMIN ONLY）
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      position_id,
      password
    } = req.body;

    if (!full_name || !phone || !email || !position_id || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = UsersDAO.createUser({
      full_name,
      phone,
      email,
      position_id,
      password_hash: hash
    });

    UsersDAO.logAction({
      userId: req.user.id,
      action: 'user_created',
      targetType: 'user',
      targetId: result.lastInsertRowid,
      details: { full_name, email, position_id }
    });

    return res.json({
      success: true,
      id: result.lastInsertRowid
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

/**
 * PATCH /users/:id - 更新员工（ADMIN ONLY）
 */
router.patch('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  const existing = UsersDAO.getUserById(id);
  if (!existing) return res.status(404).json({ error: 'User not found' });

  const fields = req.body;
  UsersDAO.updateUser(id, fields);

  UsersDAO.logAction({
    userId: req.user.id,
    action: 'user_updated',
    targetType: 'user',
    targetId: id,
    details: fields
  });

  return res.json({ success: true });
});

/**
 * PATCH /users/:id/deactivate - 禁用用户（ADMIN ONLY）
 */
router.patch('/:id/deactivate', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  UsersDAO.setActiveStatus(id, 0);

  UsersDAO.logAction({
    userId: req.user.id,
    action: 'user_deactivated',
    targetType: 'user',
    targetId: id,
    details: { is_active: 0 }
  });

  return res.json({ success: true });
});

/**
 * PATCH /users/:id/activate - 启用用户（ADMIN ONLY）
 */
router.patch('/:id/activate', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  UsersDAO.setActiveStatus(id, 1);

  UsersDAO.logAction({
    userId: req.user.id,
    action: 'user_activated',
    targetType: 'user',
    targetId: id,
    details: { is_active: 1 }
  });

  return res.json({ success: true });
});

/**
 * PATCH /users/:id/reset-password - 强制重置密码（ADMIN ONLY）
 */
router.patch('/:id/reset-password', requireAuth, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { newPassword } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password too short' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  UsersDAO.forceResetPassword(id, hash);

  UsersDAO.logAction({
    userId: req.user.id,
    action: 'admin_force_reset_password',
    targetType: 'user',
    targetId: id,
    details: null
  });

  return res.json({ success: true });
});

export default router;
