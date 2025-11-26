// backend/src/services/retailOrderService.js

import RetailOrdersDAO from '../data/retail-orders-dao.js';
import ProductsDAO from '../data/products-dao.js';
import UsersDAO from '../data/users-dao.js';
import CustomersDAO from '../data/customers-dao.js';

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
    // 创建订单（主入口）
    // =====================================================
    static createOrder(adminId, payload) {
        const { customer_id, items } = payload;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        if (customer_id) {
            const customer = CustomersDAO.getCustomerById(customer_id);
            if (!customer) throw new Error('Customer not found');
        }

        // ------ 计算金额 ------
        let subtotal = 0;

        const processedItems = items.map(it => {
            const product = ProductsDAO.getProductById(it.product_id);
            if (!product) throw new Error(`Product not found: ${it.product_id}`);

            const qty = Number(it.quantity ?? 1);
            const unit_price = it.unit_price ?? product.base_price;
            const sub = unit_price * qty;

            subtotal += sub;

            return {
                product_id: product.id,
                quantity: qty,
                unit_price,
                subtotal: sub,
                product_sku: product.sku,
                product_name: product.name,
                size_label: it.size_label || null,
                color: it.color || product.color || null,
                notes: it.notes || null
            };
        });

        const discount_amount = payload.discount_amount || 0;
        const discount_rate = payload.discount_rate || null;

        let total_amount = subtotal - discount_amount;
        if (discount_rate) total_amount = subtotal * (1 - discount_rate);
        if (total_amount < 0) total_amount = 0;

        const order_number = this.generateOrderNumber();

        // ------ 写入主订单 ------
        const orderResult = RetailOrdersDAO.createOrder({
            order_number,
            customer_id,
            status: payload.status || 'pending',
            channel: payload.channel || 'in_store',
            subtotal,
            discount_amount,
            discount_rate,
            total_amount,
            deposit_amount: payload.deposit_amount || 0,
            deposit_paid: payload.deposit_paid || 0,
            order_date: payload.order_date,
            due_date: payload.due_date,
            confirmed_date: payload.confirmed_date || null,
            completed_date: payload.completed_date || null,
            created_by: adminId,
            confirmed_by: payload.confirmed_by || null,
            notes: payload.notes || null
        });

        const orderId = orderResult.lastInsertRowid;

        // ------ 写入子项 ------
        for (const item of processedItems) {
            RetailOrdersDAO.createItem({
                order_id: orderId,
                ...item
            });
        }

        // ------ 审计 ------
        UsersDAO.logAction({
            userId: adminId,
            action: 'retail_order_created',
            targetType: 'retail_order',
            targetId: orderId,
            details: { orderId, order_number, item_count: items.length }
        });

        return { success: true, id: orderId, order_number };
    }

    // =====================================================
    // 更新订单（不更新 items）
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

    // =====================================================
    // 添加订单项
    // =====================================================
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

    // =====================================================
    // 更新订单项
    // =====================================================
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

    // =====================================================
    // 删除订单
    // =====================================================
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

    // =====================================================
    // 删除订单项
    // =====================================================
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
