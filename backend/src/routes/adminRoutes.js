// backend/src/routes/adminRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import AdminService from '../services/adminService.js';

const router = express.Router();
const STAFF_ROLES = new Set(['admin', 'manager', 'sales']);

function ensureStaffRole(req, res, next) {
  const role = req.user?.role;
  if (!role || !STAFF_ROLES.has(role)) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  next();
}

/**
 * GET /api/admin/stats/dashboard
 * 仪表盘统计数据（所有员工可看，具体字段可按需调整）
 */
router.get(
  '/stats/dashboard',
  requireAuth,
  ensureStaffRole,
  async (req, res) => {
    try {
      const stats = await AdminService.getDashboardStats();
      return res.json(stats);
    } catch (err) {
      console.error('dashboard stats error:', err);
      return res.status(500).json({ error: 'Failed to load dashboard stats' });
    }
  }
);

export default router;