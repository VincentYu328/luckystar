// backend/src/routes/paymentRoutes.js

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import PaymentService from '../services/paymentService.js';

const router = express.Router();

// =========================================
// 获取所有付款记录
// GET /api/payments
// =========================================
router.get(
  '/',
  requireAuth,
  requirePermission('orders.view'),
  (req, res) => {
    const list = PaymentService.getAllPayments();
    res.json({ count: list.length, payments: list });
  }
);

// =========================================
// 获取单个付款详情
// GET /api/payments/id/:id
// =========================================
router.get(
  '/id/:id',
  requireAuth,
  requirePermission('orders.view'),
  (req, res) => {
    try {
      const payment = PaymentService.getPaymentById(Number(req.params.id));
      res.json({ payment });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

// =========================================
// 获取订单的付款记录
// GET /api/payments/:orderType/:orderId
// =========================================
router.get(
  '/:orderType/:orderId',
  requireAuth,
  requirePermission('orders.view'),
  (req, res) => {
    const { orderType, orderId } = req.params;
    const list = PaymentService.getPaymentsByOrder(orderType, Number(orderId));
    res.json({ count: list.length, payments: list });
  }
);

// =========================================
// 创建付款
// POST /api/payments
// =========================================
router.post(
  '/',
  requireAuth,
  requirePermission('orders.update'),
  (req, res) => {
    try {
      const result = PaymentService.createPayment(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// =========================================
// 验证银行转账
// POST /api/payments/:id/verify
// =========================================
router.post(
  '/:id/verify',
  requireAuth,
  requirePermission('orders.update'),
  (req, res) => {
    try {
      const result = PaymentService.verifyTransfer(req.user.id, Number(req.params.id));
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
