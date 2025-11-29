// backend/src/services/retailOrderService.js

import RetailOrdersDAO from '../data/retail-orders-dao.js';
import ProductsDAO from '../data/products-dao.js';
import UsersDAO from '../data/users-dao.js';
import CustomersDAO from '../data/customers-dao.js';
import { validateCustomerOrder } from '../utils/validate.js';

class RetailOrderService {

    // =====================================================
    // 生成订单号（RO-YYYYMMDD-xxxx）
    // =====================================================
    static generateOrderNumber() {
        const d = new Date();
        const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `RO-${date}-${rand}`;
    }

    // =====================================================
    // 查询订单
    // =====================================================
    static getAllOrders() {
        return RetailOrdersDAO.getAllOrders();
    }

    static getOrderById(orderId) {
        const order = RetailOrdersDAO.getOrderById(orderId);
        if (!order) throw new Error('Order not found');

        const items = RetailOrdersDAO.getItemsByOrder(orderId);
        return { ...order, items };
    }

    static getOrdersByCustomer(customerId) {
        return RetailOrdersDAO.getOrdersByCustomer(customerId);
    }

    static getItemsByOrderId(orderId) {
        return RetailOrdersDAO.getItemsByOrder(orderId);
    }

    // =====================================================
    // ⭐ 修复：创建订单（Admin/Staff 使用）
    // =====================================================
    static createOrder(staffId, payload) {
        console.log('[Service createOrder] Called with staffId:', staffId);
        console.log('[Service createOrder] Payload:', JSON.stringify(payload, null, 2));

        // ⭐ 关键修复：直接使用前端计算好的值
        const { customer_id, items, subtotal, total_amount, notes, status } = payload;

        // 验证必需字段
        if (!customer_id) {
            throw new Error('Customer ID is required');
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        if (subtotal === undefined || total_amount === undefined) {
            throw new Error('Subtotal and total_amount are required');
        }

        // 验证客户存在
        const customer = CustomersDAO.getCustomerById(customer_id);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // ⭐ 调试：打印原始 items 数据
        console.log('[Service createOrder] Raw items from payload:', JSON.stringify(items, null, 2));

        // 验证并处理订单项
        const processedItems = items.map((item, index) => {
            console.log(`[Service createOrder] Processing item #${index + 1}:`, JSON.stringify(item, null, 2));

            // ⭐ 关键修复：product_id 可能是字符串，需要转换
            const productId = Number(item.product_id);
            
            if (!productId || isNaN(productId)) {
                throw new Error(`Invalid product_id for item #${index + 1}: "${item.product_id}"`);
            }

            // 验证产品存在
            const product = ProductsDAO.getProductById(productId);
            if (!product) {
                throw new Error(`Product not found: ${productId} (item #${index + 1})`);
            }

            const quantity = Number(item.quantity);
            const unitPrice = Number(item.price_snapshot);

            if (isNaN(quantity) || quantity <= 0) {
                throw new Error(`Invalid quantity for ${product.name}`);
            }

            if (isNaN(unitPrice) || unitPrice < 0) {
                throw new Error(`Invalid price for ${product.name}`);
            }

            const itemSubtotal = unitPrice * quantity;

            const processedItem = {
                product_id: productId, // ⭐ 确保是数字
                quantity: quantity,
                unit_price: unitPrice,
                subtotal: itemSubtotal,
                product_sku: product.sku,
                product_name: product.name || item.name,
                size_label: item.size_label || null,
                color: item.color || product.color || null,
                notes: item.notes || null
            };

            console.log(`[Service createOrder] Processed item #${index + 1}:`, JSON.stringify(processedItem, null, 2));
            
            return processedItem;
        });

        // 生成订单号
        const order_number = this.generateOrderNumber();

        // ⭐ 关键修复：使用前端传来的 subtotal 和 total_amount
        const orderData = {
            order_number,
            customer_id: Number(customer_id),
            status: status || 'pending',
            channel: 'in_store', // Staff 创建默认为店内订单
            subtotal: Number(subtotal),
            discount_amount: 0,
            discount_rate: null,
            total_amount: Number(total_amount),
            deposit_amount: 0,
            deposit_paid: 0,
            order_date: new Date().toISOString(),
            due_date: null,
            confirmed_date: null,
            completed_date: null,
            created_by: Number(staffId), // ⭐ 使用 staffId
            confirmed_by: null,
            notes: notes || null
        };

        console.log('[Service createOrder] Creating order with data:', JSON.stringify(orderData, null, 2));

        try {
            // 创建主订单
            const orderResult = RetailOrdersDAO.createOrder(orderData);
            const orderId = orderResult.lastInsertRowid;

            console.log('[Service createOrder] Order created with ID:', orderId);

            // 创建订单项
            for (const item of processedItems) {
                RetailOrdersDAO.createItem({
                    order_id: orderId,
                    ...item
                });
            }

            console.log('[Service createOrder] All items created successfully');

            // 记录审计日志
            UsersDAO.logAction({
                userId: staffId,
                action: 'retail_order_created',
                targetType: 'retail_order',
                targetId: orderId,
                details: { 
                    orderId, 
                    order_number, 
                    item_count: items.length,
                    total_amount: total_amount 
                }
            });

            return { 
                success: true, 
                id: orderId, 
                order_number 
            };

        } catch (dbError) {
            console.error('[Service createOrder] Database error:', dbError.message);
            throw new Error(`Failed to create order: ${dbError.message}`);
        }
    }

    // =====================================================
    // 客户自助下单逻辑
    // =====================================================
    static submitSelfServiceOrder(customerId, payload) {
        validateCustomerOrder(payload);

        const order_number = this.generateOrderNumber();
        const total_amount = payload.total;
        const subtotal = payload.total;

        const orderData = {
            order_number,
            customer_id: customerId,
            subtotal: subtotal,
            total_amount: total_amount,
            channel: 'online',
            status: 'pending',
            created_by: null // 客户自助，无 staff
        };

        const itemsToInsert = payload.items.map(item => {
            return {
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.price_snapshot,
                subtotal: item.price_snapshot * item.quantity,
                product_name: item.name,
                product_sku: null,
                size_label: null,
                color: null,
                notes: null
            };
        });

        try {
            const newOrderId = RetailOrdersDAO.createSelfServiceOrder(orderData, itemsToInsert);
            return { id: newOrderId, order_number: orderData.order_number };
        } catch (error) {
            console.error("[RetailOrderService] Failed to submit self-service order:", error);
            if (error.message.includes('FOREIGN KEY')) {
                throw new Error("Order Submission Error: One or more products are invalid.");
            }
            throw new Error("Database error during order submission.");
        }
    }

    // =====================================================
    // 更新订单状态
    // =====================================================
    static updateOrderStatus(staffId, orderId, newStatus) {
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}`);
        }

        const order = RetailOrdersDAO.getOrderById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        const updateFields = { status: newStatus };

        if (newStatus === 'confirmed') {
            updateFields.confirmed_date = new Date().toISOString();
            updateFields.confirmed_by = staffId;
        } else if (newStatus === 'completed') {
            updateFields.completed_date = new Date().toISOString();
        }

        RetailOrdersDAO.updateOrder(orderId, updateFields);

        UsersDAO.logAction({
            userId: staffId,
            action: 'retail_order_status_updated',
            targetType: 'retail_order',
            targetId: orderId,
            details: { old_status: order.status, new_status: newStatus }
        });

        return { success: true, status: newStatus };
    }

    // =====================================================
    // 其他方法保持不变
    // =====================================================
    static updateOrder(adminId, orderId, fields) {
        const existing = RetailOrdersDAO.getOrderById(orderId);
        if (!existing) throw new Error('Order not found');

        RetailOrdersDAO.updateOrder(orderId, fields);

        UsersDAO.logAction({
            userId: adminId,
            action: 'retail_order_updated',
            targetType: 'retail_order',
            targetId: orderId,
            details: fields
        });

        return { success: true };
    }

    static addOrderItem(adminId, orderId, payload) {
        const order = RetailOrdersDAO.getOrderById(orderId);
        if (!order) throw new Error('Order not found');

        const result = RetailOrdersDAO.createItem({
            order_id: orderId,
            ...payload
        });

        UsersDAO.logAction({
            userId: adminId,
            action: 'retail_order_item_added',
            targetType: 'retail_order_item',
            targetId: result.lastInsertRowid,
            details: payload
        });

        return { success: true, id: result.lastInsertRowid };
    }

    static updateOrderItem(adminId, itemId, fields) {
        const existing = RetailOrdersDAO.getItemById(itemId);
        if (!existing) throw new Error('Order item not found');

        RetailOrdersDAO.updateItem(itemId, fields);

        UsersDAO.logAction({
            userId: adminId,
            action: 'retail_order_item_updated',
            targetType: 'retail_order_item',
            targetId: itemId,
            details: fields
        });

        return { success: true };
    }

    static deleteOrder(adminId, orderId) {
        const existing = RetailOrdersDAO.getOrderById(orderId);
        if (!existing) throw new Error('Order not found');

        RetailOrdersDAO.deleteOrder(orderId);

        UsersDAO.logAction({
            userId: adminId,
            action: 'retail_order_deleted',
            targetType: 'retail_order',
            targetId: orderId
        });

        return { success: true };
    }

    static deleteOrderItem(adminId, itemId) {
        const existing = RetailOrdersDAO.getItemById(itemId);
        if (!existing) throw new Error('Order item not found');

        RetailOrdersDAO.deleteItem(itemId);

        UsersDAO.logAction({
            userId: adminId,
            action: 'retail_order_item_deleted',
            targetType: 'retail_order_item',
            targetId: itemId
        });

        return { success: true };
    }
}

export default RetailOrderService;