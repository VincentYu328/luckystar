// backend/src/routes/auditRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import AuditService from '../services/auditService.js';

const router = express.Router();

// 获取全部日志
router.get(
  '/',
  requireAuth,
  requirePermission('audit.view'),
  (req, res) => {
    const list = AuditService.getAllLogs();
    res.json({ count: list.length, logs: list });
  }
);

// 获取单条日志
router.get(
  '/:id',
  requireAuth,
  requirePermission('audit.view'),
  (req, res) => {
    try {
      const log = AuditService.getLogById(Number(req.params.id));
      res.json(log);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

export default router;
