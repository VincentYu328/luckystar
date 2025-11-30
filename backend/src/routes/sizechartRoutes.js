// backend/src/routes/sizechartRoutes.js
import express from 'express';
import SizeChartService from '../services/sizechartService.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = express.Router();

/**
 * ======================================================
 * Public Route - MUST BE FIRST to avoid conflict with /:id
 * ======================================================
 */
// GET /api/sizecharts/public
router.get('/public', (req, res) => {
  try {
    const charts = SizeChartService.getAllCharts();

    const chartsWithItems = charts.map(chart => {
      const items = SizeChartService.getItemsByChart(chart.id);
      return {
        ...chart,
        items
      };
    });

    res.json(chartsWithItems);
  } catch (err) {
    console.error('Error fetching public size charts:', err);
    res.status(500).json({ error: 'Failed to load size charts' });
  }
});

/**
 * ======================================================
 * Size Charts（主表）
 * ======================================================
 */

// GET /api/sizecharts
router.get(
  '/',
  requireAuth,
  requirePermission('products.view'),
  (req, res) => {
    const charts = SizeChartService.getAllCharts();
    res.json({ count: charts.length, charts });
  }
);

// GET /api/sizecharts/:id
router.get(
  '/:id',
  requireAuth,
  requirePermission('products.view'),
  (req, res) => {
    try {
      const chart = SizeChartService.getChartById(Number(req.params.id));
      res.json(chart);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

// POST /api/sizecharts
router.post(
  '/',
  requireAuth,
  requirePermission('products.create'),
  (req, res) => {
    try {
      const result = SizeChartService.createChart(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PUT /api/sizecharts/:id
router.put(
  '/:id',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = SizeChartService.updateChart(
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

// DELETE /api/sizecharts/:id
router.delete(
  '/:id',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = SizeChartService.deleteChart(
        req.user.id,
        Number(req.params.id)
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * ======================================================
 * Size Chart Items（尺码项）
 * ======================================================
 */

// GET /api/sizecharts/:id/items
router.get(
  '/:id/items',
  requireAuth,
  requirePermission('products.view'),
  (req, res) => {
    const items = SizeChartService.getItemsByChart(Number(req.params.id));
    res.json({ count: items.length, items });
  }
);

// POST /api/sizecharts/:id/items
router.post(
  '/:id/items',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = SizeChartService.createItem(req.user.id, {
        ...req.body,
        chart_id: Number(req.params.id),
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PUT /api/sizecharts/items/:itemId
router.put(
  '/items/:itemId',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = SizeChartService.updateItem(
        req.user.id,
        Number(req.params.itemId),
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE /api/sizecharts/items/:itemId
router.delete(
  '/items/:itemId',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = SizeChartService.deleteItem(
        req.user.id,
        Number(req.params.itemId)
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
