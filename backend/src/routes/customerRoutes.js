// backend/src/routes/customerRoutes.js

import express from 'express';
// Assuming the following imports are correctly set up in your backend:
import CustomerService from '../services/customerService.js';
import RetailOrderService from '../services/retailOrderService.js';
import { requireAuth } from '../middleware/auth.js'; // Staff Auth Middleware
import { requirePermission } from '../middleware/rbac.js';
import { requireCustomerAuth } from '../middleware/customerAuth.js'; // Customer Auth Middleware
import { verifyCustomerAuth } from '../middleware/customerAuth.js'; // Assuming this is the correct middleware name

const router = express.Router();

/* ======================================================
    工具：判断 customer 是否访问自己的数据
====================================================== */
function isSelf(req) {
    // Note: The logic in the provided code snippet seems complex, 
    // we rely on the customerAuth middleware populating req.customer for /me routes, 
    // and checking against req.params.id for other routes.
    return (
        req.user?.role === 'customer' &&
        Number(req.params.id) === req.user.customerId
    );
}
/* ======================================================
    MY 页面（customer 前台）- /me/* 路径
====================================================== */

// --- /me Routes --- (GET /api/customers/me)
router.get('/me', requireCustomerAuth, async (req, res) => {
    try {
        const me = await CustomerService.getCustomerById(req.customer.id);
        res.json(me);
    } catch (err) {
        console.error("[Route GET /me] Error:", err);
        res.status(404).json({ error: err.message });
    }
});

// PUT /api/customers/me ← 更新 Profile
router.put('/me', requireCustomerAuth, async (req, res) => {
    try {
        const updated = await CustomerService.updateMyProfile(req.customer.id, req.body);
        res.json(updated);
    } catch (err) {
        console.error("[Route PUT /me] Error:", err);
        res.status(400).json({ error: err.message });
    }
});

// --- /me/profile ---
router.get('/me/profile', requireCustomerAuth, async (req, res) => {
    try {
        const me = await CustomerService.getMyProfile(req.customer.id);
        res.json({ profile: me });
    } catch (err) {
        console.error("[Route GET /me/profile] Error:", err);
        res.status(404).json({ error: err.message });
    }
});

router.put('/me/profile', requireCustomerAuth, async (req, res) => {
    try {
        await CustomerService.updateMyProfile(req.customer.id, req.body);
        res.json({ success: true });
    } catch (err) {
        console.error("[Route PUT /me/profile] Error:", err);
        res.status(400).json({ error: err.message });
    }
});

// --- /me/measurements ---
router.get('/me/measurements', requireCustomerAuth, async (req, res) => {
    try {
        console.log('🔍 [Route] GET /me/measurements - Customer ID:', req.customer.id);
        
        const m = await CustomerService.getMyMeasurements(req.customer.id);
        
        console.log('📦 [Route] Retrieved measurements:', m);
        
        // ✅ 直接返回对象（不包裹），如果没有就返回 null
        if (!m) {
            console.log('⚠️ [Route] No measurements found, returning null');
            return res.json(null);
        }
        
        res.json(m);  // 直接返回 { id: 1, height: 170, ... }
    } catch (err) {
        console.error("[Route GET /me/measurements] Error:", err);
        res.status(404).json({ error: err.message });
    }
});

router.put('/me/measurements', requireCustomerAuth, async (req, res) => {
    try {
        console.log('🔍 [Route] PUT /me/measurements - Customer ID:', req.customer.id);
        console.log('📦 [Route] Received data:', req.body);
        
        const result = await CustomerService.updateMyMeasurements(req.customer.id, req.body);
        
        console.log('✅ [Route] Service returned:', result);
        
        // ✅ 返回更新后的数据，而不是 { success: true }
        const updated = await CustomerService.getMyMeasurements(req.customer.id);
        res.json(updated);
        
    } catch (err) {
        console.error("[Route PUT /me/measurements] Error:", err);
        res.status(400).json({ error: err.message });
    }
});

// --- /me/orders ---

// GET /api/customers/me/orders (List all orders)
router.get('/me/orders', requireCustomerAuth, async (req, res) => {
    try {
        const orders = RetailOrderService.getOrdersByCustomer(req.customer.id);
        // Rule 6: Return unified structure { items: [...] }
        res.json({ items: orders });
    } catch (err) {
        console.error("[Route GET /me/orders] Error:", err);
        res.status(500).json({ error: 'Failed to retrieve customer orders.' });
    }
});

// POST /api/customers/me/orders (Submit new order)
router.post('/me/orders', requireCustomerAuth, async (req, res) => {
    try {
        const customerId = req.customer.id;
        const orderData = req.body;

        const result = await RetailOrderService.submitSelfServiceOrder(customerId, orderData);

        return res.status(201).json({ 
            message: "Order submitted successfully.",
            id: result.id,
            order_number: result.order_number
        });

    } catch (error) {
        console.error("[Route POST /me/orders] Error:", error.message);

        if (error.message.includes('Validation Error')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('Order Submission Error')) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Failed to create order due to a server error.' });
    }
});

// ⭐ MISSING ROUTE ADDED: GET /api/customers/me/orders/:id (Retrieve Single Order)
router.get('/me/orders/:id', requireCustomerAuth, async (req, res) => {
    const customerId = req.customer.id;
    const orderId = Number(req.params.id);

    try {
        // 1. 获取订单及订单项。RetailOrderService.getOrderById 返回 { ...order, items: [...] }
        const orderWithItems = RetailOrderService.getOrderById(orderId);

        // 2. 严格安全检查：确保订单属于当前客户
        if (!orderWithItems || orderWithItems.customer_id !== customerId) {
            console.warn(`[Route GET /me/orders/:id] Forbidden access attempt: User ${customerId} trying to view Order ${orderId}.`);
            // 返回 404 避免泄漏订单 ID 是否存在的秘密
            return res.status(404).json({ error: 'Order not found.' });
        }
        
        // 3. 确保返回结构匹配前端 load 函数的期望: { order: {...}, items: [...] }
        return res.status(200).json({
            order: orderWithItems, 
            items: orderWithItems.items // Service returns { ...order, items: [...] }
        });

    } catch (error) {
        console.error(`[Route GET /me/orders/:id] Error retrieving order ${orderId}:`, error.message);
        if (error.message.includes('Order not found')) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        return res.status(500).json({ error: 'Server error retrieving order details.' });
    }
});


/* ======================================================
    Customers（后台 staff + customer 自身访问）
====================================================== */
// NOTE: The rest of the routes below assume the middleware is handling staff/customer roles appropriately
// The original code was using 'requireAuth' (Staff JWT) for all routes below.

/* ======================================================
    Group Orders (MUST come before /:id routes!)
====================================================== */

// GET /api/customers/group-orders - List all group orders (must come before /:id/group-orders)
router.get(
    '/group-orders',
    requireAuth,
    requirePermission('customers.view'),
    async (req, res) => {
        try {
            console.log('🔍 [Route] GET /customers/group-orders - Staff user:', req.user);
            const orders = CustomerService.getAllGroupOrders();
            console.log('✅ [Route] Found', orders.length, 'group orders');
            res.json({ count: orders.length, orders });
        } catch (err) {
            console.error('❌ [Route] Error fetching all group orders:', err);
            res.status(500).json({ error: err.message });
        }
    }
);

router.get(
    '/group-orders/:orderId',
    requireAuth,
    requirePermission('customers.view'),
    async (req, res) => {
        try {
            const order = await CustomerService.getGroupOrderById(Number(req.params.orderId));
            res.json(order);
        } catch (err) {
            console.error(`Error fetching group order ID ${req.params.orderId}:`, err);
            res.status(404).json({ error: err.message });
        }
    }
);

router.post(
    '/group-orders',
    requireAuth,
    requirePermission('customers.create'),
    async (req, res) => {
        try {
            const result = await CustomerService.createGroupOrder(req.user.id, req.body);
            res.status(201).json(result);
        } catch (err) {
            console.error("Error creating group order:", err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.put(
    '/group-orders/:orderId',
    requireAuth,
    requirePermission('customers.update'),
    async (req, res) => {
        try {
            const result = await CustomerService.updateGroupOrder(
                req.user.id,
                Number(req.params.orderId),
                req.body
            );
            res.json(result);
        } catch (err) {
            console.error(`Error updating group order ID ${req.params.orderId}:`, err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.delete(
    '/group-orders/:orderId',
    requireAuth,
    requirePermission('customers.update'),
    async (req, res) => {
        try {
            const result = await CustomerService.deleteGroupOrder(
                req.user.id,
                Number(req.params.orderId)
            );
            res.json(result);
        } catch (err) {
            console.error(`Error deleting group order ID ${req.params.orderId}:`, err);
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
    async (req, res) => {
        try {
            const members = await CustomerService.getGroupMembers(Number(req.params.orderId));
            res.json({ count: members.length, members });
        } catch (err) {
            console.error(`Error fetching group members for order ID ${req.params.orderId}:`, err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.post(
    '/group-orders/:orderId/members',
    requireAuth,
    requirePermission('customers.update'),
    async (req, res) => {
        try {
            console.log('[POST /group-orders/:orderId/members] orderId:', req.params.orderId);
            console.log('[POST /group-orders/:orderId/members] req.body:', JSON.stringify(req.body));

            const payload = {
                ...req.body,
                group_order_id: Number(req.params.orderId)
            };

            console.log('[POST /group-orders/:orderId/members] payload to service:', JSON.stringify(payload));

            const result = await CustomerService.createGroupMember(req.user.id, payload);

            console.log('[POST /group-orders/:orderId/members] result:', JSON.stringify(result));

            res.status(201).json(result);
        } catch (err) {
            console.error(`[POST /group-orders/:orderId/members] Error creating group member for order ID ${req.params.orderId}:`, err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.put(
    '/group-members/:id',
    requireAuth,
    requirePermission('customers.update'),
    async (req, res) => {
        try {
            const result = await CustomerService.updateGroupMember(
                req.user.id,
                Number(req.params.id),
                req.body
            );
            res.json(result);
        } catch (err) {
            console.error(`Error updating group member ID ${req.params.id}:`, err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.delete(
    '/group-members/:id',
    requireAuth,
    requirePermission('customers.update'),
    async (req, res) => {
        try {
            const result = await CustomerService.deleteGroupMember(
                req.user.id,
                Number(req.params.id)
            );
            res.json(result);
        } catch (err) {
            console.error(`Error deleting group member ID ${req.params.id}:`, err);
            res.status(400).json({ error: err.message });
        }
    }
);

/* ======================================================
    General Customer Routes (MUST come after specific routes!)
====================================================== */

router.get(
    '/',
    // Assuming 'requireAuth' is the staff check
    requireAuth,
    requirePermission('customers.view'),
    (req, res) => {
        try {
            const rawKeyword = req.query.keyword;
            const keyword = rawKeyword ? String(rawKeyword).trim() : '';

            console.log('[Backend CustomerRoutes] GET / - Processed keyword:', keyword);

            let customers;

            if (keyword.length > 0) {
                customers = CustomerService.search(keyword);
            } else {
                customers = CustomerService.getAllCustomers();
            }

            res.json({ count: customers.length, customers });
        } catch (error) {
            console.error('Error fetching customers:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

router.post(
    '/',
    requireAuth,
    requirePermission('customers.create'),
    async (req, res) => {
        try {
            const result = await CustomerService.createCustomer(req.user.id, req.body);
            res.status(201).json(result);
        } catch (err) {
            console.error("Error creating customer:", err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.get('/:id/group-orders', requireAuth, async (req, res) => {
    console.log('🔍 [Route] GET /customers/:id/group-orders - ID:', req.params.id, 'User:', req.user);

    if (req.user.role !== 'customer') {
        requirePermission('customers.view')(req, res, () => {});
        if (res.headersSent) return;
    }

    if (req.user.role === 'customer' && !isSelf(req)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const orders = await CustomerService.getGroupOrdersByCustomer(Number(req.params.id));
        res.json({ count: orders.length, orders });
    } catch (err) {
        console.error(`❌ [Route] Error fetching group orders for customer ID ${req.params.id}:`, err);
        res.status(400).json({ error: err.message });
    }
});

/* ======================================================
    Customer Measurements (后台 staff 管理客户量体记录)
====================================================== */
router.get(
    '/:id/measurements',
    requireAuth,
    requirePermission('customers.view'),
    async (req, res) => {
        try {
            const customerId = Number(req.params.id);
            const list = await CustomerService.getMeasurementsForCustomer(customerId);
            res.json({ count: list.length, measurements: list });
        } catch (err) {
            console.error(`Error fetching measurements for customer ID ${req.params.id}:`, err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.post(
    '/:id/measurements',
    requireAuth,
    requirePermission('customers.update'),
    async (req, res) => {
        try {
            const result = await CustomerService.createMeasurementForCustomer(
                req.user.id,
                Number(req.params.id),
                req.body
            );
            res.status(201).json(result);
        } catch (err) {
            console.error(`Error creating measurement for customer ID ${req.params.id}:`, err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.get('/:id', requireAuth, async (req, res) => {
    // Complex authorization logic relies on middleware setup and isSelf helper
    if (req.user.role !== 'customer') {
        requirePermission('customers.view')(req, res, () => {});
        if (res.headersSent) return;
    }

    if (req.user.role === 'customer' && !isSelf(req)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const customer = await CustomerService.getCustomerById(Number(req.params.id));
        res.json({ customer });
    } catch (err) {
        console.error(`Error getting customer ID ${req.params.id}:`, err);
        res.status(404).json({ error: err.message });
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'customer') {
        requirePermission('customers.update')(req, res, () => {});
        if (res.headersSent) return;
    }

    if (req.user.role === 'customer' && !isSelf(req)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const result = await CustomerService.updateCustomer(
            req.user.id,
            Number(req.params.id),
            req.body
        );
        res.json(result);
    } catch (err) {
        console.error(`Error updating customer ID ${req.params.id}:`, err);
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'customer') {
        requirePermission('customers.update')(req, res, () => {});
        if (res.headersSent) return;
    }

    if (req.user.role === 'customer') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const result = await CustomerService.deleteCustomer(
            req.user.id,
            Number(req.params.id)
        );
        res.json(result);
    } catch (err) {
        console.error(`Error deleting customer ID ${req.params.id}:`, err);
        res.status(400).json({ error: err.message });
    }
});

export default router;