// backend/src/services/customerService.js
import CustomersDAO from '../data/customers-dao.js';
import UsersDAO from '../data/users-dao.js';
import MeasurementsDAO from '../data/measurements-dao.js';
import bcrypt from 'bcrypt';

class CustomerService {

    // =====================================================
    // Customers (后台)
    // =====================================================

    static getAllCustomers() {
        return CustomersDAO.getAllCustomers();
    }

    static getCustomerById(id) {
        const cus = CustomersDAO.getCustomerById(id);
        if (!cus) throw new Error('Customer not found');
        return cus;
    }

    static search(keyword) {
        return CustomersDAO.searchCustomers(keyword);
    }

    static async createCustomer(adminId, payload) {
        const { full_name, phone, email, password } = payload;

        if (!full_name || !phone || !email) {
            throw new Error('Missing required fields');
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

        UsersDAO.logAction({
            userId: adminId,
            action: 'customer_created',
            targetType: 'customer',
            targetId: result.lastInsertRowid,
            details: { full_name, phone, email }
        });

        return { success: true, id: result.lastInsertRowid };
    }

    static async updateCustomer(adminId, id, fields) {
        const existing = CustomersDAO.getCustomerById(id);
        if (!existing) throw new Error('Customer not found');

        if (fields.password) {
            fields.password_hash = await bcrypt.hash(fields.password, 10);
            delete fields.password;
        }

        CustomersDAO.updateCustomer(id, fields);

        UsersDAO.logAction({
            userId: adminId,
            action: 'customer_updated',
            targetType: 'customer',
            targetId: id,
            details: fields
        });

        return { success: true };
    }

    static deleteCustomer(adminId, id) {
        CustomersDAO.deleteCustomer(id);

        UsersDAO.logAction({
            userId: adminId,
            action: 'customer_deleted',
            targetType: 'customer',
            targetId: id,
            details: null
        });

        return { success: true };
    }


    // =====================================================
    // Group Orders (后台)
    // =====================================================

    static getGroupOrdersByCustomer(customerId) {
        return CustomersDAO.getGroupOrdersByCustomer(customerId);
    }

    static getGroupOrderById(orderId) {
        const order = CustomersDAO.getGroupOrderById(orderId);
        if (!order) throw new Error('Group order not found');
        return order;
    }

    static createGroupOrder(adminId, payload) {
        const required = [
            'leader_id',
            'leader_name',
            'leader_phone',
            'leader_email',
            'group_name',
            'fabric_selected'
        ];

        for (const r of required) {
            if (!payload[r]) throw new Error(`Missing required field: ${r}`);
        }

        const result = CustomersDAO.createGroupOrder(payload);

        UsersDAO.logAction({
            userId: adminId,
            action: 'group_order_created',
            targetType: 'group_order',
            targetId: result.lastInsertRowid,
            details: payload
        });

        return { success: true, id: result.lastInsertRowid };
    }

    static updateGroupOrder(adminId, orderId, fields) {
        const existing = CustomersDAO.getGroupOrderById(orderId);
        if (!existing) throw new Error('Group order not found');

        CustomersDAO.updateGroupOrder(orderId, fields);

        UsersDAO.logAction({
            userId: adminId,
            action: 'group_order_updated',
            targetType: 'group_order',
            targetId: orderId,
            details: fields
        });

        return { success: true };
    }

    static deleteGroupOrder(adminId, orderId) {
        CustomersDAO.deleteGroupOrder(orderId);

        UsersDAO.logAction({
            userId: adminId,
            action: 'group_order_deleted',
            targetType: 'group_order',
            targetId: orderId,
            details: null
        });

        return { success: true };
    }


    // =====================================================
    // Group Members (后台)
    // =====================================================

    static getGroupMembers(orderId) {
        return CustomersDAO.getGroupMembers(orderId);
    }

    static getGroupMemberById(id) {
        const member = CustomersDAO.getGroupMemberById(id);
        if (!member) throw new Error('Group member not found');
        return member;
    }

    static createGroupMember(adminId, payload) {
        const required = ['group_order_id', 'full_name', 'phone'];
        for (const r of required) {
            if (!payload[r]) throw new Error(`Missing required field: ${r}`);
        }

        const result = CustomersDAO.createGroupMember(payload);

        UsersDAO.logAction({
            userId: adminId,
            action: 'group_member_created',
            targetType: 'group_member',
            targetId: result.lastInsertRowid,
            details: payload
        });

        return { success: true, id: result.lastInsertRowid };
    }

    static updateGroupMember(adminId, id, fields) {
        const existing = CustomersDAO.getGroupMemberById(id);
        if (!existing) throw new Error('Group member not found');

        CustomersDAO.updateGroupMember(id, fields);

        UsersDAO.logAction({
            userId: adminId,
            action: 'group_member_updated',
            targetType: 'group_member',
            targetId: id,
            details: fields
        });

        return { success: true };
    }

    static deleteGroupMember(adminId, id) {
        CustomersDAO.deleteGroupMember(id);

        UsersDAO.logAction({
            userId: adminId,
            action: 'group_member_deleted',
            targetType: 'group_member',
            targetId: id,
            details: null
        });

        return { success: true };
    }


    // =====================================================
    // Measurements (后台)
    // =====================================================

    static getMeasurementsForCustomer(id) {
        return MeasurementsDAO.getByCustomer(id);
    }

    static getMeasurementsForGroupMember(id) {
        return MeasurementsDAO.getByGroupMember(id);
    }


    // =====================================================
    // ⭐⭐⭐ 顾客端：My Profile ⭐⭐⭐
    // =====================================================

    static getMyProfile(customerId) {
        return CustomersDAO.getBasicProfile(customerId);
    }

    static updateMyProfile(customerId, fields) {
        return CustomersDAO.updateBasicProfile(customerId, fields);
    }


    // =====================================================
    // ⭐⭐⭐ 顾客端：My Measurements ⭐⭐⭐
    // =====================================================

    static getMyMeasurements(customerId) {
        return CustomersDAO.getMyMeasurements(customerId);
    }

    static updateMyMeasurements(customerId, fields) {
        return CustomersDAO.updateMyMeasurements(customerId, fields);
    }


    // =====================================================
    // ⭐⭐⭐ 顾客端：My Orders ⭐⭐⭐
    // =====================================================

    static getMyOrders(customerId) {
        return CustomersDAO.getMyRetailOrders(customerId);
    }

    static getMyOrderItems(orderId) {
        return CustomersDAO.getRetailOrderItems(orderId);
    }
}

export default CustomerService;
