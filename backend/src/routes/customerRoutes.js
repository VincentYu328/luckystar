// backend\src\routes\customerRoutes.js

import express from 'express';
import CustomerService from '../services/customerService.js';
import RetailOrderService from '../services/retailOrderService.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { requireCustomerAuth } from '../middleware/customerAuth.js';

const router = express.Router();

/* ======================================================
   工具：判断 customer 是否访问自己的数据
====================================================== */
function isSelf(req) {
  return (
    req.user?.role === 'customer' &&
    Number(req.params.id) === req.user.customerId
  );
}


/* ======================================================
   MY 页面（customer 前台）
====================================================== */

// GET /api/customers/me
router.get('/me', requireCustomerAuth, (req, res) => {
  const me = CustomerService.getCustomerById(req.customer.id);
  res.json(me);
});

// PUT /api/customers/me  ← 更新 Profile
router.put('/me', requireCustomerAuth, (req, res) => {
  try {
    const updated = CustomerService.updateMyProfile(req.customer.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================
   MY — Profile
============================ */

router.get('/me/profile', requireCustomerAuth, (req, res) => {
  const me = CustomerService.getMyProfile(req.customer.id);
  res.json({ profile: me });
});

router.put('/me/profile', requireCustomerAuth, (req, res) => {
  try {
    CustomerService.updateMyProfile(req.customer.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================
   MY — Measurements（顾客端）
============================ */

// GET 最新一条测量
router.get('/me/measurements', requireCustomerAuth, (req, res) => {
  const m = CustomerService.getMyMeasurements(req.customer.id);
  res.json({ measurements: m });
});

// PUT 更新顾客自己的测量
router.put('/me/measurements', requireCustomerAuth, (req, res) => {
  try {
    CustomerService.updateMyMeasurements(req.customer.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ============================
   MY — Retail Orders
============================ */

router.get('/me/orders', requireCustomerAuth, (req, res) => {
  const orders = CustomerService.getMyOrders(req.customer.id);
  res.json({ orders });
});

// POST /api/customers/me/orders
router.post('/me/orders', requireCustomerAuth, (req, res) => {
  try {
    const customerId = req.customer.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items required' });
    }

    const result = RetailOrderService.createOrder(customerId, {
      items,
      status: 'pending',
      source: 'web'
    });

    res.json(result);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/* ======================================================
   Customers（后台 staff + customer 自身访问）
====================================================== */

// GET /api/customers
router.get(
  '/',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    const customers = CustomerService.getAllCustomers();
    res.json({ count: customers.length, customers });
  }
);

// GET /api/customers/:id
router.get('/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'customer') {
    requirePermission('customers.view')(req, res, () => { });
    if (res.headersSent) return;
  }

  if (req.user.role === 'customer' && !isSelf(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const customer = CustomerService.getCustomerById(Number(req.params.id));
    res.json({ customer });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/customers
router.post(
  '/',
  requireAuth,
  requirePermission('customers.create'),
  (req, res) => {
    try {
      const result = CustomerService.createCustomer(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PUT /api/customers/:id
router.put('/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'customer') {
    requirePermission('customers.update')(req, res, () => { });
    if (res.headersSent) return;
  }

  if (req.user.role === 'customer' && !isSelf(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const result = CustomerService.updateCustomer(
      req.user.id,
      Number(req.params.id),
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'customer') {
    requirePermission('customers.update')(req, res, () => { });
    if (res.headersSent) return;
  }

  if (req.user.role === 'customer') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const result = CustomerService.deleteCustomer(
      req.user.id,
      Number(req.params.id)
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ======================================================
   Group Orders
====================================================== */

router.get('/:id/group-orders', requireAuth, (req, res) => {
  if (req.user.role !== 'customer') {
    requirePermission('customers.view')(req, res, () => { });
    if (res.headersSent) return;
  }

  if (req.user.role === 'customer' && !isSelf(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const orders = CustomerService.getGroupOrdersByCustomer(
    Number(req.params.id)
  );
  res.json({ count: orders.length, orders });
});

// GET group order by ID
router.get(
  '/group-orders/:orderId',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    try {
      const order = CustomerService.getGroupOrderById(
        Number(req.params.orderId)
      );
      res.json(order);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

// POST group order
router.post(
  '/group-orders',
  requireAuth,
  requirePermission('customers.create'),
  (req, res) => {
    try {
      const result = CustomerService.createGroupOrder(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PUT group order
router.put(
  '/group-orders/:orderId',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = CustomerService.updateGroupOrder(
        req.user.id,
        Number(req.params.orderId),
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE group order
router.delete(
  '/group-orders/:orderId',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = CustomerService.deleteGroupOrder(
        req.user.id,
        Number(req.params.orderId)
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* ======================================================
   Group Members
====================================================== */

router.get(
  '/group-orders/:orderId/members',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    const members = CustomerService.getGroupMembers(
      Number(req.params.orderId)
    );
    res.json({ count: members.length, members });
  }
);

router.post(
  '/group-orders/:orderId/members',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = CustomerService.createGroupMember(req.user.id, {
        ...req.body,
        group_order_id: Number(req.params.orderId)
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.put(
  '/group-members/:id',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = CustomerService.updateGroupMember(
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

router.delete(
  '/group-members/:id',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = CustomerService.deleteGroupMember(
        req.user.id,
        Number(req.params.id)
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* ======================================================
   Customer Measurements (后台 staff 管理客户量体记录)
====================================================== */

router.get(
  '/:id/measurements',
  requireAuth,
  requirePermission('customers.view'),
  (req, res) => {
    const customerId = Number(req.params.id);
    const list = CustomerService.getMeasurementsForCustomer(customerId);
    res.json({ count: list.length, measurements: list });
  }
);

router.post(
  '/:id/measurements',
  requireAuth,
  requirePermission('customers.update'),
  (req, res) => {
    try {
      const result = CustomerService.createMeasurementForCustomer(
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

export default router;
