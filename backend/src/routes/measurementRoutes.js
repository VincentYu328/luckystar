// backend/src/routes/measurementRoutes.js

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import MeasurementService from '../services/measurementService.js';
import MeasurementsDAO from '../data/measurements-dao.js';

const router = express.Router();

/**
 * ==========================================================
 * GET /api/measurements
 * 获取所有量体记录（Admin Measurement Dashboard）
 * ==========================================================
 */
router.get(
  '/',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    try {
      console.log("📘 [API] GET /api/measurements - fetch all");

      // 方案 A：统一入口 → 始终用 Service.getAll()
      const items =
        MeasurementService.getAll?.() ??
        MeasurementsDAO.getAll?.() ??
        [];

      console.log("📗 [API] measurement count:", items.length);

      res.json({ items });
    } catch (err) {
      console.error("❌ [API] GET /api/measurements failed:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * ==========================================================
 * GET /api/measurements/:id
 * 获取单条量体
 * ==========================================================
 */
router.get(
  '/:id',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    try {
      const id = Number(req.params.id);
      const measurement = MeasurementService.getMeasurementById(id);
      res.json({ measurement });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

/**
 * ==========================================================
 * PUT /api/measurements/:id
 * 更新量体
 * ==========================================================
 */
router.put(
  '/:id',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const adminId = req.user.id;
      const id = Number(req.params.id);

      const result = MeasurementService.updateMeasurement(
        adminId,
        id,
        req.body
      );

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * ==========================================================
 * DELETE /api/measurements/:id
 * 删除量体记录
 * ==========================================================
 */
router.delete(
  '/:id',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const adminId = req.user.id;
      const id = Number(req.params.id);

      const result = MeasurementService.deleteMeasurement(
        adminId,
        id
      );

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
