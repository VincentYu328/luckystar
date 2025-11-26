// backend/src/routes/measurementRoutes.js

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import MeasurementService from '../services/measurementService.js';

const router = express.Router();

/**
 * ======================================================
 * Measurements for Customers
 * ======================================================
 */

// GET /api/customers/:id/measurements
router.get(
  '/customers/:id/measurements',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    const customerId = Number(req.params.id);
    const list = MeasurementService.getMeasurementsByCustomer(customerId);
    res.json({ count: list.length, measurements: list });
  }
);

// POST /api/customers/:id/measurements
router.post(
  '/customers/:id/measurements',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = MeasurementService.createMeasurement(req.user.id, {
        ...req.body,
        customer_id: Number(req.params.id),
        group_member_id: null
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * ======================================================
 * Measurements for Group Members
 * ======================================================
 */

// GET /api/group-members/:id/measurements
router.get(
  '/group-members/:id/measurements',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    const memberId = Number(req.params.id);
    const list = MeasurementService.getMeasurementsByGroupMember(memberId);
    res.json({ count: list.length, measurements: list });
  }
);

// POST /api/group-members/:id/measurements
router.post(
  '/group-members/:id/measurements',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = MeasurementService.createMeasurement(req.user.id, {
        ...req.body,
        customer_id: null,
        group_member_id: Number(req.params.id)
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * ======================================================
 * Single Measurement Operations
 * ======================================================
 */

// GET /api/measurements/:id
router.get(
  '/measurements/:id',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    try {
      const m = MeasurementService.getMeasurementById(Number(req.params.id));
      res.json(m);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

// PUT /api/measurements/:id
router.put(
  '/measurements/:id',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = MeasurementService.updateMeasurement(
        req.user.id,
        Number(req.params.id),
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE /api/measurements/:id
router.delete(
  '/measurements/:id',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = MeasurementService.deleteMeasurement(
        req.user.id,
        Number(req.params.id)
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
