// backend/src/routes/retailOrderRoutes.js

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import RetailOrderService from '../services/retailOrderService.js';
// ⚠️ Note: redirect is usually for SvelteKit actions, keeping it here for consistency if imported elsewhere
import { redirect } from '@sveltejs/kit'; 

const router = express.Router();

/**
 * ======================================================
 * Retail Orders（零售订单）
 * ======================================================
 */

// GET /api/retail-orders (All orders)
router.get(
    '/',
    requireAuth,
    requirePermission('orders.view'),
    (req, res) => {
        const list = RetailOrderService.getAllOrders();
        res.json({ count: list.length, orders: list });
    }
);

// ⭐ GET /api/retail-orders/pending (待处理列表)
router.get(
    '/pending',
    requireAuth,
    requirePermission('orders.view'),
    (req, res) => {
        try {
            const list = RetailOrderService.getOrdersByStatus('pending'); 
            res.json({ count: list.length, orders: list });
        } catch (err) {
            console.error('[Route GET /pending] Error:', err);
            res.status(500).json({ error: err.message });
        }
    }
);

// GET /api/retail-orders/:id (Single order)
router.get(
    '/:id',
    requireAuth,
    requirePermission('orders.view'),
    (req, res) => {
        try {
            const order = RetailOrderService.getOrderById(Number(req.params.id));
            res.json(order);
        } catch (err) {
            // FIX: Use 404 for 'Order not found' if Service throws that error
            if (err.message.includes('Order not found')) {
                 return res.status(404).json({ error: err.message });
            }
            res.status(500).json({ error: err.message });
        }
    }
);

// POST /api/retail-orders (Create order - Staff)
router.post(
    '/',
    requireAuth,
    requirePermission('orders.create'),
    (req, res) => {
        try {
            console.log('[Route POST /retail-orders] Received body:', JSON.stringify(req.body, null, 2));
            
            // ⭐ 验证必需字段
            const { customer_id, items, subtotal, total_amount } = req.body;
            
            if (!customer_id || !items || items.length === 0) {
                return res.status(400).json({ 
                    error: "Missing required fields: customer_id and items are required." 
                });
            }
            
            if (subtotal === undefined || total_amount === undefined) {
                return res.status(400).json({ 
                    error: "Missing required fields: subtotal and total_amount are required." 
                });
            }

            // ⭐ 构造完整的订单数据
            const orderData = {
                customer_id: Number(customer_id),
                staff_id: req.user.id,  // 从认证用户获取
                items: items,
                subtotal: Number(subtotal),
                total_amount: Number(total_amount),
                notes: req.body.notes || '',
                status: 'pending'  // 默认状态
            };

            console.log('[Route POST /retail-orders] Calling service with orderData:', 
                JSON.stringify(orderData, null, 2));

            // ⭐ 调用服务层创建订单
            // 根据你的 Service 函数签名,可能是以下两种之一:
            // 选项 1: const result = RetailOrderService.createOrder(orderData);
            // 选项 2: const result = RetailOrderService.createOrder(req.user.id, orderData);
            
            // 先尝试选项 2 (原始签名)
            const result = RetailOrderService.createOrder(req.user.id, orderData);
            
            console.log('[Route POST /retail-orders] Order created successfully:', result.id);
            res.json(result);
            
        } catch (err) {
            console.error('[Route POST /retail-orders] Error:', err.message);
            console.error('[Route POST /retail-orders] Stack:', err.stack);
            res.status(400).json({ error: err.message });
        }
    }
);

// PUT /api/retail-orders/:id
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

// DELETE /api/retail-orders/:id
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

// ⭐ PATCH /api/retail-orders/:id/status (更新订单状态) - FIX: Error handling
router.patch(
    '/:id/status',
    requireAuth,
    requirePermission('orders.update'),
    async (req, res) => {
        const orderId = Number(req.params.id);
        const { status } = req.body; // Expects { status: 'confirmed' | 'cancelled' }

        if (!status) {
            return res.status(400).json({ error: 'New status is required.' });
        }

        try {
            const result = await RetailOrderService.updateOrderStatus(
                req.user.id,
                orderId,
                status
            );
            res.json({ success: true, ...result });

        } catch (err) {
            console.error(`[Route PATCH /status] Error updating order ${orderId}:`, err.message);
            
            if (err.message.includes('Order not found')) {
                return res.status(404).json({ error: err.message }); // 404 for Not Found
            }
            if (err.message.includes('Invalid status')) {
                return res.status(400).json({ error: err.message }); // 400 for bad input
            }
            
            res.status(500).json({ error: 'Internal server error during status update.' });
        }
    }
);

/**
 * ======================================================
 * Retail Order Items（订单项）
 * ======================================================
 */

// GET /api/retail-orders/:id/items
router.get(
    '/:id/items',
    requireAuth,
    requirePermission('orders.view'),
    (req, res) => {
        const items = RetailOrderService.getItemsByOrderId(Number(req.params.id));
        res.json({ count: items.length, items });
    }
);

// POST /api/retail-orders/:id/items
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

// PUT /api/retail-order-items/:itemId
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

// DELETE /api/retail-order-items/:itemId
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