import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import RetailOrderService from '../services/retailOrderService.js';

const router = express.Router();

/**
 * ======================================================
 * Retail Orders（零售订单）
 * ======================================================
 */

/**
 * GET /api/retail-orders
 * 查询所有订单（支持后台查看）
 */
router.get(
  '/',
  requireAuth,
  requirePermission('orders.view'),
  (req, res) => {
    const list = RetailOrderService.getAllOrders();
    res.json({ count: list.length, orders: list });
  }
);

/**
 * GET /api/retail-orders/:id
 * 查询单个订单
 */
router.get(
  '/:id',
  requireAuth,
  requirePermission('orders.view'),
  (req, res) => {
    try {
      const order = RetailOrderService.getOrderById(Number(req.params.id));
      res.json(order);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

/**
 * POST /api/retail-orders
 * 创建订单（可用于前台或后台）
 * 前端下单时 status=pending
 */
router.post(
  '/',
  requireAuth,
  requirePermission('orders.create'),
  (req, res) => {
    try {
      const result = RetailOrderService.createOrder(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * PUT /api/retail-orders/:id
 * 修改订单（订单状态、订单信息等）
 */
router.put(
  '/:id',
  requireAuth,
  requirePermission('orders.update'),
  (req, res) => {
    try {
      const result = RetailOrderService.updateOrder(
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

/**
 * DELETE /api/retail-orders/:id
 * 删除订单（如取消订单）
 */
router.delete(
  '/:id',
  requireAuth,
  requirePermission('orders.delete'),
  (req, res) => {
    try {
      const result = RetailOrderService.deleteOrder(
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
 * Retail Order Items（订单项）
 * ======================================================
 */

/**
 * GET /api/retail-orders/:id/items
 * 查询指定订单的所有订单项
 */
router.get(
  '/:id/items',
  requireAuth,
  requirePermission('orders.view'),
  (req, res) => {
    const items = RetailOrderService.getItemsByOrderId(Number(req.params.id));
    res.json({ count: items.length, items });
  }
);

/**
 * POST /api/retail-orders/:id/items
 * 创建订单项
 */
router.post(
  '/:id/items',
  requireAuth,
  requirePermission('orders.update'),
  (req, res) => {
    try {
      const result = RetailOrderService.addOrderItem(
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

/**
 * PUT /api/retail-order-items/:itemId
 * 更新订单项
 */
router.put(
  '/items/:itemId',
  requireAuth,
  requirePermission('orders.update'),
  (req, res) => {
    try {
      const result = RetailOrderService.updateOrderItem(
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

/**
 * DELETE /api/retail-order-items/:itemId
 * 删除订单项
 */
router.delete(
  '/items/:itemId',
  requireAuth,
  requirePermission('orders.update'),
  (req, res) => {
    try {
      const result = RetailOrderService.deleteOrderItem(
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
