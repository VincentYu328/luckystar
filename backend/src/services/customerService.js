// backend/src/services/customerService.js (完整修正版本 - 兼容同步 DAO)

import CustomersDAO from '../data/customers-dao.js';
import UsersDAO from '../data/users-dao.js';
import MeasurementsDAO from '../data/measurements-dao.js';
import MeasurementService from './measurementService.js';
import bcrypt from 'bcrypt';

class CustomerService {

    // =====================================================
    // Customers（后台）
    // =====================================================
    static getAllCustomers() {
        console.log("[CustomerService] getAllCustomers called (no keyword)");
        return CustomersDAO.getAllCustomers();
    }

    static getCustomerById(id) {
        console.log(`[CustomerService] getCustomerById called for ID: ${id}`);
        const cus = CustomersDAO.getCustomerById(id);
        if (!cus) {
            throw new Error('Customer not found');
        }
        return cus;
    }

    static search(keyword) {
        console.log("[CustomerService] search called with keyword:", keyword);
        return CustomersDAO.searchCustomers(keyword);
    }

    static async createCustomer(adminId, payload) {
        console.log("[CustomerService] createCustomer called by adminId:", adminId, "with payload:", payload);

        const { full_name, phone, email, password } = payload;

        if (!full_name || !phone || !email) {
            throw new Error('Missing required fields: full_name, phone, or email');
        }
        if (!password) {
            throw new Error('Password is required for creating customer');
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = CustomersDAO.createCustomer({
            ...payload,
            password_hash,
            is_active: 1,
            type: payload.type || 'retail'
        });

        console.log("[CustomerService] CustomersDAO.createCustomer result:", result);

        await UsersDAO.logAction({
            userId: adminId,
            action: 'customer_created',
            targetType: 'customer',
            targetId: result.lastInsertRowid,
            details: { full_name, phone, email }
        });

        console.log("[CustomerService] Admin action logged for customer ID:", result.lastInsertRowid);

        return { success: true, id: result.lastInsertRowid };
    }

    static async updateCustomer(adminId, id, fields) {
        console.log(`[CustomerService] updateCustomer called by adminId: ${adminId} for customer ID: ${id} with fields:`, fields);

        const existing = CustomersDAO.getCustomerById(id);
        if (!existing) throw new Error('Customer not found');

        if (fields.password) {
            fields.password_hash = await bcrypt.hash(fields.password, 10);
            delete fields.password;
        }

        CustomersDAO.updateCustomer(id, fields);
        console.log(`[CustomerService] CustomersDAO.updateCustomer for ID: ${id} completed.`);

        await UsersDAO.logAction({
            userId: adminId,
            action: 'customer_updated',
            targetType: 'customer',
            targetId: id,
            details: fields
        });

        console.log("[CustomerService] Admin action logged for customer ID:", id);

        return { success: true };
    }

    static async deleteCustomer(adminId, id) {
        console.log(`[CustomerService] deleteCustomer called by adminId: ${adminId} for customer ID: ${id}`);

        CustomersDAO.deleteCustomer(id);
        console.log(`[CustomerService] CustomersDAO.deleteCustomer for ID: ${id} completed.`);

        await UsersDAO.logAction({
            userId: adminId,
            action: 'customer_deleted',
            targetType: 'customer',
            targetId: id,
            details: null
        });

        console.log("[CustomerService] Admin action logged for customer ID:", id);

        return { success: true };
    }

    // =====================================================
    // Group Orders（后台）
    // =====================================================
    static getGroupOrdersByCustomer(customerId) {
        console.log(`[CustomerService] getGroupOrdersByCustomer called for customer ID: ${customerId}`);
        return CustomersDAO.getGroupOrdersByCustomer(customerId);
    }

    static getGroupOrderById(orderId) {
        console.log(`[CustomerService] getGroupOrderById called for order ID: ${orderId}`);
        const order = CustomersDAO.getGroupOrderById(orderId);
        if (!order) throw new Error('Group order not found');
        return order;
    }

    static createGroupOrder(adminId, payload) {
        console.log("[CustomerService] createGroupOrder called with payload:", payload);
        return CustomersDAO.createGroupOrder(payload);
    }

    static updateGroupOrder(adminId, orderId, fields) {
        console.log(`[CustomerService] updateGroupOrder called for order ID: ${orderId} with fields:`, fields);
        CustomersDAO.updateGroupOrder(orderId, fields);
        return { success: true };
    }

    static deleteGroupOrder(adminId, orderId) {
        console.log(`[CustomerService] deleteGroupOrder called for order ID: ${orderId}`);
        CustomersDAO.deleteGroupOrder(orderId);
        return { success: true };
    }

    // =====================================================
    // Group Members
    // =====================================================
    static getGroupMembers(orderId) {
        console.log(`[CustomerService] getGroupMembers called for order ID: ${orderId}`);
        return CustomersDAO.getGroupMembers(orderId);
    }

    static createGroupMember(adminId, payload) {
        console.log("[CustomerService] createGroupMember called with payload:", payload);
        return CustomersDAO.createGroupMember(payload);
    }

    static updateGroupMember(adminId, id, fields) {
        console.log(`[CustomerService] updateGroupMember called by adminId: ${adminId} for member ID: ${id} with fields:`, fields);
        CustomersDAO.updateGroupMember(id, fields);
        return { success: true };
    }

    static deleteGroupMember(adminId, id) {
        console.log(`[CustomerService] deleteGroupMember called by adminId: ${adminId} for member ID: ${id}`);
        CustomersDAO.deleteGroupMember(id);
        return { success: true };
    }

    // =====================================================
    // Measurements（后台）
    // =====================================================
    static getMeasurementsForCustomer(id) {
        console.log(`[CustomerService] getMeasurementsForCustomer called for customer ID: ${id}`);
        return MeasurementsDAO.getByCustomer(id);
    }

    static async createMeasurementForCustomer(adminId, customerId, fields) {
        console.log(`[CustomerService] createMeasurementForCustomer called by adminId: ${adminId} for customer ID: ${customerId} with fields:`, fields);

        return await MeasurementService.createMeasurement(adminId, {
            ...fields,
            customer_id: customerId,
            group_member_id: null
        });
    }

    // =====================================================
    // Customer Portal: My Profile
    // =====================================================
    static getMyProfile(customerId) {
        console.log(`[CustomerService] getMyProfile called for customer ID: ${customerId}`);
        return CustomersDAO.getBasicProfile(customerId);
    }

    static updateMyProfile(customerId, fields) {
        console.log(`[CustomerService] updateMyProfile called for customer ID: ${customerId} with fields:`, fields);
        return CustomersDAO.updateBasicProfile(customerId, fields);
    }

    // =====================================================
    // Customer Portal: My Measurements
    // =====================================================
    static getMyMeasurements(customerId) {
        console.log(`[CustomerService] getMyMeasurements called for customer ID: ${customerId}`);
        return CustomersDAO.getMyMeasurements(customerId);
    }

    static updateMyMeasurements(customerId, fields) {
        console.log(`[CustomerService] updateMyMeasurements called for customer ID: ${customerId} with fields:`, fields);

        const existing = CustomersDAO.getMyMeasurements(customerId);
        if (!existing) {
            return CustomersDAO.createMyMeasurements(customerId, fields);
        }
        return CustomersDAO.updateMyMeasurements(customerId, fields);
    }

    // =====================================================
    // Customer Portal: My Orders
    // =====================================================
    static getMyOrders(customerId) {
        console.log(`[CustomerService] getMyOrders called for customer ID: ${customerId}`);
        return CustomersDAO.getMyRetailOrders(customerId);
    }
}

export default CustomerService;